'use strict';

const suite = require('core/suite');
const provisioner = require('core/provisioner');
const cloud = require('core/cloud');
const tools = require('core/tools');
const defaults = require('core/defaults');
const R = require('ramda');
const chakram = require('chakram');
const expect = chakram.expect;

const vdrSystem = tools.requirePayload(`${__dirname}/assets/vdr.system.json`);
const vdrMulti = tools.requirePayload(`${__dirname}/assets/vdr.multi.json`);
const vdrMultiAcct = tools.requirePayload(`${__dirname}/assets/vdr.multi.json`);
const transformationSystem = tools.requirePayload(`${__dirname}/assets/transformation.system.json`);
const transformationMulti = tools.requirePayload(`${__dirname}/assets/transformation.multi.json`);
const transformationMultiAcct = tools.requirePayload(`${__dirname}/assets/transformation.multi.json`);
const schema = tools.requirePayload(`${__dirname}/assets/transformation.schema.json`);
const pluralSchema = tools.requirePayload(`${__dirname}/assets/transformations.schema.json`);
pluralSchema.definitions.transformation = schema;

// Adds the correct vdrFieldId to the transformation field by matching on the path and then removes the path
const addMatchingVdrFieldId = (vdrFields, tField) => {
    const matchingVdrField = R.find(R.propEq('path', tField.path))(vdrFields);
    if (matchingVdrField == null) { return tField; }
    return R.pipe(
        R.assoc('vdrFieldId', matchingVdrField.id),
        R.dissoc('path')
    )(tField);
};

suite.forPlatform('vdrs/{id}/transformations', {schema}, test => {
    let myAccountId, account, orgUser, acctUser, instanceId;
    let vdrSysId;
    let updatePayloadSys;
    before(() => {
      const opts = { qs: { where: 'defaultAccount=true' } };
      return cloud.withOptions(opts).get('/accounts')
        .then(r => {
          expect(r.body.length).to.equal(1);
          myAccountId = r.body[0].id;
          const user = { email: `churros+vdrs${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'Bingobango1!' };
          return cloud.post(`/accounts/${r.body[0].id}/users`, user);
        })
        .then(r => {
          orgUser = r.body;
        })
        .then(() => cloud.post(`/accounts`, {name: `churros+vdrs${tools.random()}`, externalId: `churros${tools.random()}@cloud-elements.com`}))
        .then(r =>{
          account = r.body;
          const user = { email: `churros+vdrs${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'Bingobango1!' };
          return cloud.post(`/accounts/${account.id}/users`, user);
        })
        .then(r => {
          acctUser = r.body;
        })
        .then(r => provisioner.create('closeio'))       
        .then(r => {
          instanceId = r.body.id;
          vdrMulti.fields[2].associatedId = instanceId;
          vdrMulti.fields[3].associatedId = instanceId;
          transformationMulti.script.instanceId = instanceId;
          transformationMulti.instanceId = instanceId;
        })
        .then(r => cloud.post('/vdrs?systemOnly=true', vdrSystem))
        .then(r => {
            vdrSysId = r.body.id;
            // add the vdr field ids to each of the transformation fields
            transformationSystem.fields = R.map(f => addMatchingVdrFieldId(r.body.fields, f), transformationSystem.fields);

            // set the update payload to change the name and remove a field
            updatePayloadSys = R.assoc('vendorName', 'updatedVendorName', transformationSystem);
            updatePayloadSys.fields = R.dropLast(1, updatePayloadSys.fields);
        });
    });

    after(() => {
      return cloud.delete(`/users/${orgUser.id}`, R.always(true))
        .then(() => cloud.delete(`/users/${acctUser.id}`, R.always(true)))
        .then(() => cloud.delete(`/accounts/${account.id}`, R.always(true)))
        .then(() => cloud.delete(`/instances/${instanceId}`, R.always(true)))
        .then(() => cloud.delete(`/vdrs/${vdrSysId}?systemOnly=true`, R.always(true)));
    });
    
    const cloudWithOrgUser = () => cloud.withOptions({ headers: { Authorization: `User ${orgUser.secret}, Organization ${defaults.secrets().orgSecret}` } });
    const cloudWithAcctUser = () => cloud.withOptions({ headers: { Authorization: `User ${acctUser.secret}, Organization ${defaults.secrets().orgSecret}` } });

    // NOTE - you need the 'vdrAdmin' role to run these tests
    it('should test CRUDS for vdr transformations', () => {
        return cloud.withOptions({churros: {updatePayloadSys}, qs: {systemOnly: true}})
            .crud(`/vdrs/${vdrSysId}/transformations`, transformationSystem, schema, chakram.put)
            .then(r => cloud.get(`/vdrs/${vdrSysId}/transformations?systemOnly=true`, pluralSchema));
    });

    it('should support CRUDS for multi-level VDR transformations for user with OAI privs', () => {
        let transformationMultiId, updatePayload, vdrMultiId, updatePayloadMulti;
        return cloud.put(`/users/${orgUser.id}/roles/org-admin`)
            // set up the vdr
            .then(r => cloudWithOrgUser().post('/vdrs', vdrMulti))
            .then(r => {
                vdrMultiId = r.body.id;
                // add the vdr field ids to each of the transformation fields
                transformationMulti.fields = R.map(f => addMatchingVdrFieldId(r.body.fields, f), transformationMulti.fields);
    
                // set the update payload to change the name and remove an instance field
                updatePayloadMulti = R.assoc('vendorName', 'updatedVendorName', transformationMulti);
                updatePayloadMulti.fields = R.dropLast(1, updatePayloadMulti.fields);
            })
            // test transformations
            .then(() => cloudWithOrgUser().post(`/vdrs/${vdrMultiId}/transformations`, transformationMulti, schema))
            .then(r => {
              expect(r.body.fields.length).to.equal(4);
              expect(r.response.headers['elements-error']).to.be.undefined;
              transformationMultiId = r.body.id;
            })
            .then(() => cloudWithOrgUser().get(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`, schema))
            .then(r => {
              expect(r.body.fields.length).to.equal(4);
              expect(r.response.headers['elements-error']).to.be.undefined;
            })
            .then(() => cloudWithOrgUser().get(`/vdrs/${vdrMultiId}/transformations`, pluralSchema))
            .then(() => cloudWithOrgUser().put(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`, updatePayloadMulti, schema))
            .then(r => {
              expect(r.body.fields.length).to.equal(3);
              expect(r.response.headers['elements-error']).to.be.undefined;
            })
            .then(() => cloudWithOrgUser().delete(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`))
            .then(r => {
              expect(r.response.headers['elements-error']).to.be.undefined;
            })
            .then(() => cloudWithOrgUser().get(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`, r => expect(r).to.have.statusCode(404)))
            .then(() => cloud.delete(`/users/${orgUser.id}/roles/org-admin`))
            .then(() => cloud.delete(`/vdrs/${vdrMultiId}`));
    });

    it('should support CRUDS for multi-level VDR transformations for user with AI privs', () => {
        let transformationMultiId, updatePayload, vdrMultiId, acctUserInstanceId, updatePayloadMulti;
        vdrMultiAcct.fields[2].path = 'subAcctInstanceField'; 
        vdrMultiAcct.fields[3].path = 'subAcctInstanceField2'; 
        transformationMultiAcct.fields[2].path = 'subAcctInstanceField'; 
        transformationMultiAcct.fields[3].path = 'subAcctInstanceField2'; 
        return cloud.put(`/users/${orgUser.id}/roles/org-admin`)
            .then(r => cloud.put(`/users/${acctUser.id}/roles/admin`))
            // set up an instance for this user to use
            .then(() => defaults.withDefaults(acctUser.secret, defaults.secrets().orgSecret, acctUser.email))
            .then(r => provisioner.create('closeio'))   
            .then(r => {
                acctUserInstanceId = r.body.id;
                vdrMultiAcct.instanceId = acctUserInstanceId;
                vdrMultiAcct.fields[2].associatedId = acctUserInstanceId;
                vdrMultiAcct.fields[3].associatedId = acctUserInstanceId;
                transformationMultiAcct.script.instanceId = acctUserInstanceId;
                transformationMultiAcct.instanceId = acctUserInstanceId;
                defaults.reset();
            })
            // set up the vdr
            .then(r => cloudWithOrgUser().post('/vdrs', vdrMulti))
            .then(r => cloudWithAcctUser().put(`/vdrs/${r.body.id}`, vdrMultiAcct))
            .then(r => {
                vdrMultiId = r.body.id;
                // add the vdr field ids to each of the transformation fields
                transformationMultiAcct.fields = R.map(f => addMatchingVdrFieldId(r.body.fields, f), transformationMultiAcct.fields);
                transformationMultiAcct.fields = R.filter(f => f.vdrFieldId != null && f.vdrFieldId != undefined, transformationMultiAcct.fields)
    
                // set the update payload to change the name and remove an instance field
                updatePayloadMulti = R.assoc('vendorName', 'updatedVendorName', transformationMultiAcct);
                updatePayloadMulti.fields = R.dropLast(1, updatePayloadMulti.fields);
            })
            // test transformations
            .then(() => cloudWithAcctUser().post(`/vdrs/${vdrMultiId}/transformations`, transformationMultiAcct, schema))
            .then(r => {
                expect(r.body.fields.length).to.equal(3);
                expect(r.response.headers['elements-error']).to.contain('ignored');
                transformationMultiId = r.body.id;
            })
            .then(() => cloudWithAcctUser().get(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`, schema))
            .then(r => {
                expect(r.body.fields.length).to.equal(3);
                expect(r.response.headers['elements-error']).to.be.undefined;
            })
            .then(() => cloudWithAcctUser().get(`/vdrs/${vdrMultiId}/transformations`, pluralSchema))
            .then(() => cloudWithAcctUser().put(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`, updatePayloadMulti, schema))
            .then(r => {
                expect(r.body.fields.length).to.equal(2);
                expect(r.response.headers['elements-error']).to.contain('ignored');
            })
            .then(() => cloudWithAcctUser().delete(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`))
            .then(r => {
                expect(r.response.headers['elements-error']).to.be.undefined;
            })
            .then(() => cloudWithAcctUser().get(`/vdrs/${vdrMultiId}/transformations/${transformationMultiId}`, r => expect(r).to.have.statusCode(404)))
            .then(() => cloud.delete(`/users/${orgUser.id}/roles/org-admin`))
            .then(() => cloudWithAcctUser().delete(`/vdrs/${vdrMultiId}`))
            .then(() => cloudWithAcctUser().delete(`/instances/${acctUserInstanceId}`))
    });

    it('should return a list of mapped element ids on a VDR when a transformation exists', () => {
        let transformationId;
    
        const validator = r => {
          expect(r).to.have.statusCode(200);
          expect(r.body.mappedElementIds).to.have.length(1);
        };
    
        return cloud.post(`/vdrs/${vdrSysId}/transformations`, transformationSystem)
            .then(r => transformationId = r.body.id)
            .then(() => cloud.get(`/vdrs/${vdrSysId}`, validator))
            .then(() => cloud.delete(`/vdrs/${vdrSysId}/transformations/${transformationId}`));
    });

    it('should support cloning a VDR and its transformations from the system catalog to the user\'s account', () => {
        let accountId, transformationId;
        const newObjectName = `myNewObjectName-${tools.randomStr('string', 6)}`;
  
        return cloud.post(`/vdrs/${vdrSysId}/transformations`, transformationSystem)
            .then(r => transformationId = r.body.id)
            // test a basic clone
            .then(() => cloud.post(`/vdrs/${vdrSysId}/clone`, {}))
            .then(() => cloud.get(`/accounts/objects/${vdrSystem.objectName}/definitions`))
            // test cloning with a new objectName and including transformations
            .then(() => cloud.post(`/vdrs/${vdrSysId}/clone?cloneAllTransformations=true`, {objectName: newObjectName}))
            .then(() => cloud.get(`/accounts/objects/${newObjectName}/definitions`))
            .then(() => cloud.get(`/accounts/${myAccountId}/elements/${transformationSystem.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/${myAccountId}/elements/${transformationSystem.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/objects/${vdrSystem.objectName}/definitions`))
            .then(() => cloud.delete(`/accounts/objects/${newObjectName}/definitions`))
            .then(() => cloud.delete(`/vdrs/${vdrSysId}/transformations/${transformationId}`));
      });

    it('should support cloning a subset of transformations by elementKey', () => {
        let accountId;
        let transformationIds = [];
        const newObjectName = vdrSystem.objectName;

        const transformationOne = transformationSystem;
        const transformationTwo = R.assoc('elementKey', 'sfdc', transformationSystem);
        const transformationThree = R.assoc('elementKey', 'hubspotcrm', transformationSystem);

        const expectEmpty = r => {
            expect(r).to.have.statusCode(404);
        };

        return cloud.post(`/vdrs/${vdrSysId}/transformations`, transformationSystem)
            .then(r => transformationIds.push(r.body.id))
            .then(()=> cloud.post(`/vdrs/${vdrSysId}/transformations`, transformationTwo))
            .then(r => transformationIds.push(r.body.id))
            .then(()=> cloud.post(`/vdrs/${vdrSysId}/transformations`, transformationThree))
            .then(r => transformationIds.push(r.body.id))
            // Test cloning two of the three mapped elements
            .then(() => cloud.withOptions({qs: {'elementKeys[]': `${transformationOne.elementKey},${transformationTwo.elementKey}`}}).post(`/vdrs/${vdrSysId}/clone`, {}))
            .then(() => cloud.get(`/accounts/objects/${newObjectName}/definitions`))
            // Validate that the transformation was clone correctly
            .then(() => cloud.get(`/accounts/${myAccountId}/elements/${transformationOne.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.get(`/accounts/${myAccountId}/elements/${transformationTwo.elementKey}/transformations/${newObjectName}`))
            // Validate only the first two element trasformations were cloned
            .then(() => cloud.get(`/accounts/${myAccountId}/elements/${transformationThree.elementKey}/transformations/${newObjectName}`, expectEmpty))
            // Cleanup
            .then(() => cloud.delete(`/accounts/${myAccountId}/elements/${transformationOne.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/${myAccountId}/elements/${transformationTwo.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/objects/${newObjectName}/definitions`))
            .then(() => transformationIds.forEach(id => {
                cloud.delete(`/vdrs/${vdrSysId}/transformations/${id}`);
            }));
    });
});
