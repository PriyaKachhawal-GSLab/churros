'use strict';

const suite = require('core/suite');
const provisioner = require('core/provisioner');
const cloud = require('core/cloud');
const tools = require('core/tools');
const defaults = require('core/defaults');
const R = require('ramda');
const chakram = require('chakram');
const expect = chakram.expect;

const signup = tools.requirePayload(`${__dirname}/assets/signup.json`);

const vdrSystem = tools.requirePayload(`${__dirname}/assets/vdr.system.json`);
const vdrMulti = tools.requirePayload(`${__dirname}/assets/vdr.multi.json`);
const schema = tools.requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = tools.requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;
const snippets = tools.requirePayload(`${__dirname}/assets/snippets.json`);

// NOTE - you will need the customerAdmin privilege to run these tests (to signup a new user with a new org)
suite.forPlatform('vdrs', {payload: vdrSystem, schema}, test => {
    let user, account, org, instance1, instance2;
    const closeioKey = 'closeio';
    beforeEach(() => {
        return cloud.post(`/customers/signup`, signup)
            .then(r => {
                user = r.body.user;
                account = r.body.account;
                org = r.body.organization;
                // the default for a new org is still v1, eventually we will update this
                expect(org.vdrVersion).to.equal('v1');
            })
            .then(() => defaults.withDefaults(user.secret, org.secret, user.email))
            .then(r => provisioner.create(closeioKey))
            .then(r => instance1 = r.body)
            .then(() => defaults.withDefaults(user.secret, org.secret, user.email))
            .then(r => provisioner.create(closeioKey))
            .then(r => instance2 = r.body)
            .then(() => defaults.reset())
            .catch(() => defaults.reset());
    });

    afterEach(() => {
        return cloud.delete(`/customers/organizations/${org.id}`);
    });

    const cloudWithUser = () => cloud.withOptions({ headers: { Authorization: `User ${user.secret}, Organization ${org.secret}` } });
    const cloudWithInstance = () => cloud.withOptions({ headers: { Authorization: `User ${user.secret}, Organization ${org.secret}, Element ${instance1.token}`} });
    const cloudWithInstance2 = () => cloud.withOptions({ headers: { Authorization: `User ${user.secret}, Organization ${org.secret}, Element ${instance2.token}`} });

    const genObj = path => {
        return {
        fields: [
            {
                path: 'vdr' + path,
                type: 'string'
            }
        ]
        };
    };

    const genTransform = path => {
        return {
            vendorName: 'contacts',
            fields: [
                {
                    path: 'vdr' + path,
                    vendorPath:  path,
                    vendorType: 'string'
                }
            ],
            configuration: [
                {
                    type: "inherit"
                },
                {
                    properties: {
                        fromVendor: false,
                        toVendor: false
                    },
                    type: "passThrough"
                }
            ]
        };
        };

    const validateObject = (numFields, paths) => r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.fields.length).to.equal(numFields);
        paths.forEach(path => {
            expect(r.body.fields.filter(R.propEq('path', path))).to.not.be.empty;
        })
        
    };

    const validateVdrVersion = version => r => {
        expect(r.body.vdrVersion).to.equal(version);
    }

    it('should support upgrade and rollback of my VDR version multiple times', () => {
        // create some v1 objects
        return cloudWithUser().post(`/organizations/objects/${vdrSystem.objectName}/definitions`, genObj('name'), validateObject(1, ['vdrname']))
            .then(r => cloudWithUser().post(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('name')))
            // upgrade 
            .then(r => cloudWithUser().put(`/vdrs/upgrade/v2`, {}))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v2')))
            // roll back
            .then(r => cloudWithUser().delete(`/vdrs/upgrade/v2`))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v1')))
            // upgrade again
            .then(r => cloudWithUser().put(`/vdrs/upgrade/v2`, {}))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v2')))
            // roll back again
            .then(r => cloudWithUser().delete(`/vdrs/upgrade/v2`))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v1')));
    });

    it('should support upgrade and rollback of any org\'s VDR version for a vdrAdmin', () => {
        const opts = {
            qs: {
                'orgIds[]': org.id
            }
        };

        return cloudWithUser().post(`/organizations/objects/${vdrSystem.objectName}/definitions`, genObj('name'), validateObject(1, ['vdrname']))
            .then(r => cloudWithUser().post(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('name')))
            // upgrade 
            .then(r => cloud.withOptions(opts).put(`/vdrs/upgrade/v2`, {}))
            .then(r => cloud.get(`/customers/organizations/${org.id}`, validateVdrVersion('v2')))
            // roll back
            .then(r => cloud.withOptions(opts).delete(`/vdrs/upgrade/v2`))
            .then(r => cloud.get(`/customers/organizations/${org.id}`, validateVdrVersion('v1')))
    });

    // test upgrade/rollback for calling user's org
    it('should support upgrade and rollback of my VDR version with org level VDRs', () => {
        let vdrId, transformationId;
        const validateOrgTransformExistsAndWorks = () => {
            return cloudWithUser().get(`/organizations/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrname']))
                .then(r => vdrId = r.body.id)
                .then(() => cloudWithUser().get(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`))
                .then(r => transformationId = r.body.id)
                .then(() => cloudWithInstance().get(`hubs/crm/${vdrSystem.objectName}?pageSize=5`, r => {
                    expect(r).to.have.statusCode(200);
                    expect(r.body).to.not.be.empty;
                    r.body.forEach(item => {
                        expect(item.vdrname).to.not.be.undefined;
                        expect(item.name).to.be.undefined;
                    })
                }));
        };

        // create some v1 objects
        return cloudWithUser().post(`/organizations/objects/${vdrSystem.objectName}/definitions`, genObj('name'), validateObject(1, ['vdrname']))
            .then(r => cloudWithUser().post(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('name')))
            // validate
            .then(r => validateOrgTransformExistsAndWorks())
            // upgrade this org
            .then(r => cloudWithUser().put(`/vdrs/upgrade/v2`, {}))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v2')))
            // validate everything in v2
            .then(r => validateOrgTransformExistsAndWorks())
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}`, validateObject(1, ['vdrname'])))
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}/transformations/${transformationId}`))
            // roll back
            .then(r => cloudWithUser().delete(`/vdrs/upgrade/v2`))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v1')))
            // validate again in v1
            .then(r => validateOrgTransformExistsAndWorks())
        });

    it('should support upgrade and rollback of my VDR version with org and account level VDRs', () => {
        let vdrId, transformationId;
        const validateOrgAcctTransformExistsAndWorks = () => {
            return cloudWithUser().get(`/organizations/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrname']))
                .then(r => vdrId = r.body.id)
                .then(() => cloudWithUser().get(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`))
                .then(r => transformationId = r.body.id)
                .then(() => cloudWithUser().get(`/accounts/${account.id}/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrid'])))
                .then(() => cloudWithUser().get(`/accounts/${account.id}/elements/${closeioKey}/transformations/${vdrSystem.objectName}`))
                .then(() => cloudWithInstance().get(`hubs/crm/${vdrSystem.objectName}?pageSize=5`, r => {
                    expect(r).to.have.statusCode(200);
                    expect(r.body).to.not.be.empty;
                    r.body.forEach(item => {
                        expect(item.vdrname).to.not.be.undefined;
                        expect(item.name).to.be.undefined;
                        expect(item.vdrid).to.not.be.undefined;
                        expect(item.id).to.be.undefined;
                    })
                }));
        };
    
        // create some v1 objects (org)
        return cloudWithUser().post(`/organizations/objects/${vdrSystem.objectName}/definitions`, genObj('name'), validateObject(1, ['vdrname']))
            .then(r => cloudWithUser().post(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('name')))
            // create some v1 objects (account)
            .then(() => cloudWithUser().post(`/accounts/${account.id}/objects/${vdrSystem.objectName}/definitions`, genObj('id'), validateObject(1, ['vdrid'])))
            .then(r => cloudWithUser().post(`/accounts/${account.id}/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('id')))
            // validate
            .then(r => validateOrgAcctTransformExistsAndWorks())
            // upgrade this org
            .then(r => cloudWithUser().put(`/vdrs/upgrade/v2`, {}))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v2')))
            // validate everything in v2
            .then(r => validateOrgAcctTransformExistsAndWorks())
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}`, validateObject(2, ['vdrname', 'vdrid'])))
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}/transformations/${transformationId}`))
            // roll back
            .then(r => cloudWithUser().delete(`/vdrs/upgrade/v2`))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v1')))
            // validate back in v1
            .then(r => validateOrgAcctTransformExistsAndWorks());
    });

    it('should support upgrade and rollback of my VDR version with org, account, and instance level VDRs', () => {
        let vdrId, transformationId;
        const validateOAITransformExistsAndWorks = () => {
            return cloudWithUser().get(`/organizations/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrname']))
                .then(r => vdrId = r.body.id)
                .then(() => cloudWithUser().get(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`))
                .then(r => transformationId = r.body.id)
                .then(() => cloudWithUser().get(`/accounts/${account.id}/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrid'])))
                .then(() => cloudWithUser().get(`/accounts/${account.id}/elements/${closeioKey}/transformations/${vdrSystem.objectName}`))
                .then(() => cloudWithUser().get(`/instances/${instance1.id}/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrphones[*].phone'])))
                .then(() => cloudWithUser().get(`/instances/${instance2.id}/objects/${vdrSystem.objectName}/definitions`, validateObject(1, ['vdrphones[*].type'])))
                .then(() => cloudWithUser().get(`/instances/${instance1.id}/transformations/${vdrSystem.objectName}`))
                .then(() => cloudWithUser().get(`/instances/${instance2.id}/transformations/${vdrSystem.objectName}`))
                .then(() => cloudWithInstance().get(`hubs/crm/${vdrSystem.objectName}?pageSize=5`, r => {
                    expect(r).to.have.statusCode(200);
                    expect(r.body).to.not.be.empty;
                    r.body.forEach(item => {
                        expect(item.vdrname).to.not.be.undefined;
                        expect(item.name).to.be.undefined;
                        expect(item.vdrid).to.not.be.undefined;
                        expect(item.id).to.be.undefined;
                        expect(item.vdrphones[0].phone).to.not.be.undefined;
                        expect(item.vdrphones[0].type).to.be.undefined;
                        expect(item.phones).to.be.undefined;
                    })
                }))
                .then(() => cloudWithInstance2().get(`hubs/crm/${vdrSystem.objectName}?pageSize=5`, r => {
                    expect(r).to.have.statusCode(200);
                    expect(r.body).to.not.be.empty;
                    r.body.forEach(item => {
                        expect(item.vdrname).to.not.be.undefined;
                        expect(item.name).to.be.undefined;
                        expect(item.vdrid).to.not.be.undefined;
                        expect(item.id).to.be.undefined;
                        expect(item.vdrphones[0].type).to.not.be.undefined;
                        expect(item.vdrphones[0].phone).to.be.undefined;
                        expect(item.phones).to.be.undefined;
                    })
                }));
        };
    
        // create some v1 objects (org)
        return cloudWithUser().post(`/organizations/objects/${vdrSystem.objectName}/definitions`, genObj('name'), validateObject(1, ['vdrname']))
            .then(r => cloudWithUser().post(`/organizations/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('name')))
            // create some v1 objects (account)
            .then(() => cloudWithUser().post(`/accounts/${account.id}/objects/${vdrSystem.objectName}/definitions`, genObj('id'), validateObject(1, ['vdrid'])))
            .then(r => cloudWithUser().post(`/accounts/${account.id}/elements/${closeioKey}/transformations/${vdrSystem.objectName}`, genTransform('id')))
            // create some v1 objects (instances)
            .then(() => cloudWithUser().post(`/instances/${instance1.id}/objects/${vdrSystem.objectName}/definitions`, genObj('phones[*].phone'), validateObject(1, ['vdrphones[*].phone'])))
            .then(() => cloudWithUser().post(`/instances/${instance2.id}/objects/${vdrSystem.objectName}/definitions`, genObj('phones[*].type'), validateObject(1, ['vdrphones[*].type'])))
            .then(() => cloudWithUser().post(`/instances/${instance1.id}/transformations/${vdrSystem.objectName}`, genTransform('phones[*].phone')))
            .then(() => cloudWithUser().post(`/instances/${instance2.id}/transformations/${vdrSystem.objectName}`, genTransform('phones[*].type')))

            // validate
            .then(r => validateOAITransformExistsAndWorks())

            // upgrade this org
            .then(r => cloudWithUser().put(`/vdrs/upgrade/v2`, {}))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v2')))
            // validate everything in v2
            .then(r => validateOAITransformExistsAndWorks())
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}`, validateObject(4, ['vdrname', 'vdrid', 'vdrphones[*].phone', 'vdrphones[*].type'])))
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}/transformations/${transformationId}?instanceId=${instance1.id}`, r => {
                expect(r).to.have.statusCode(200);
                expect(r.body.fields.length).to.equal(3);
                expect(r.body.fields.filter(R.propEq('path', 'vdrname'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('path', 'vdrid'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('path', 'vdrphones[*].phone'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('vendorPath', 'name'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('vendorPath', 'id'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('vendorPath', 'phones[*].phone'))).to.not.be.empty;
            }))
            .then(r => cloudWithUser().get(`/vdrs/${vdrId}/transformations/${transformationId}?instanceId=${instance2.id}`, r => {
                expect(r).to.have.statusCode(200);
                expect(r.body.fields.length).to.equal(3);
                expect(r.body.fields.filter(R.propEq('path', 'vdrname'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('path', 'vdrid'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('path', 'vdrphones[*].type'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('vendorPath', 'name'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('vendorPath', 'id'))).to.not.be.empty;
                expect(r.body.fields.filter(R.propEq('vendorPath', 'phones[*].type'))).to.not.be.empty; 
            }))
    
            // roll back
            .then(r => cloudWithUser().delete(`/vdrs/upgrade/v2`))
            .then(r => cloudWithUser().get(`/organizations/me`, validateVdrVersion('v1')))
    
            // validate back in v1
            .then(r => validateOAITransformExistsAndWorks());
    });
});