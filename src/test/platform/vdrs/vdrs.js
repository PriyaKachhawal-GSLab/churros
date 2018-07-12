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
const schema = tools.requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = tools.requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;

suite.forPlatform('vdrs', {payload: vdrSystem, schema}, test => {

  let account, orgUser, acctUser, instance1Id, instance2Id;
    before(() => {
      const opts = { qs: { where: 'defaultAccount=true' } };
      return cloud.withOptions(opts).get('/accounts')
        .then(r => {
          expect(r.body.length).to.equal(1);
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
        .then(r => instance1Id = r.body.id)
        .then(r => provisioner.create('closeio'))       
        .then(r => {
          instance2Id = r.body.id;
          vdrMulti.fields[2].associatedId = instance1Id;
          vdrMulti.fields[3].associatedId = instance2Id;
        });
    });

    after(() => {
      return cloud.delete(`/users/${orgUser.id}`, R.always(true))
        .then(() => cloud.delete(`/users/${acctUser.id}`, R.always(true)))
        .then(() => cloud.delete(`/accounts/${account.id}`, R.always(true)))
        .then(() => cloud.delete(`/instances/${instance1Id}`, R.always(true)))
        .then(() => cloud.delete(`/instances/${instance2Id}`, R.always(true)));
  });

  const cloudWithOrgUser = () => cloud.withOptions({ headers: { Authorization: `User ${orgUser.secret}, Organization ${defaults.secrets().orgSecret}` } });
  const cloudWithAcctUser = () => cloud.withOptions({ headers: { Authorization: `User ${acctUser.secret}, Organization ${defaults.secrets().orgSecret}` } });

  const genUpdatePayload = (payload, fields, newFieldLevel, instanceId) => {
    let up = R.assoc('objectName', 'updatedObjectName2', payload);
    up.fields = fields;
    up.fields[0].path = 'anUpdateField';
    up.fields.push({type: 'string', path: 'aNewField', level: newFieldLevel, instanceId});
    up.instanceId = instanceId;
    return up;
  };

  // NOTE - you need the 'vdrAdmin' role to run this tests
  it('should support CRUDS for system VDRs', () => {
    let vdrId, updatePayload;
    return cloud.post('/vdrs?systemOnly=true', vdrSystem, schema)
        .then(r => {
            vdrId = r.body.id;
            updatePayload = genUpdatePayload(vdrSystem, r.body.fields, 'system');
        })
        .then(() => cloud.get(`/vdrs/${vdrId}?systemOnly=true`, schema))
        .then(() => cloud.get(`/vdrs`, pluralSchema))
        .then(() => cloud.put(`/vdrs/${vdrId}?systemOnly=true`, updatePayload, schema))
        .then(() => cloud.delete(`/vdrs/${vdrId}?systemOnly=true`));
  });

  // NOTE - you need the 'vdrAdmin' role to run this tests
  it('should support extending a system VDR but not modifying it without privileges', () => {
    let vdrId, updatePayloadInst, updatePayloadSys;
    return cloud.post('/vdrs?systemOnly=true', vdrSystem, schema)
        .then(r => {
            vdrId = r.body.id;
            expect(r.body.fields.length).to.equal(4);
            updatePayloadInst = genUpdatePayload(vdrSystem, r.body.fields, 'instance', instance1Id);
        })
        // can add fields for my org
        .then(() => cloudWithOrgUser().put(`/vdrs/${vdrId}`, updatePayloadInst, schema))
        .then(r => {
          // validate added org field
          expect(r.body.fields.length).to.equal(5);
          // validate did not change name of the sys vdr
          expect(r.body.objectName).to.equal(vdrSystem.objectName);
          updatePayloadSys = genUpdatePayload(vdrSystem, r.body.fields, 'system');
        })
        
        .then(() => cloudWithOrgUser().get(`/vdrs/${vdrId}?systemOnly=true`, schema))
        .then(r => {
          // validate we can get just the system fields
          expect(r.body.fields.length).to.equal(4);
        })
        .then(() => cloudWithOrgUser().get(`/vdrs/${vdrId}`, schema))
        .then(r => {
          // validate we can get all fields
          expect(r.body.fields.length).to.equal(5);
        })
        .then(() => cloudWithOrgUser().put(`/vdrs/${vdrId}`, updatePayloadSys, schema))
        .then(r => {
          // validate it did not add a new system field
          expect(r.body.fields.length).to.equal(5);
        })
        .then(() => cloudWithOrgUser().delete(`/vdrs/${vdrId}`))
        .then(r => {
          // validate it returned the Elements-Error header and didn't delete the system vdr
          expect(r.response.statusCode).to.equal(200);
          expect(r.response.headers['elements-error']).to.contain('ignored');
        })
        .then(() => cloudWithOrgUser().get(`/vdrs/${vdrId}`, schema))
        .then(r => {
          // validate its back to just the system fields
          expect(r.body.fields.length).to.equal(4);
        });
  });

  it('should support CRUDS for multi-level VDRs for user with OAI privs', () => {
    let vdrId, updatePayload;
    return cloud.put(`/users/${orgUser.id}/roles/org-admin`)
        .then(() => cloudWithOrgUser().post('/vdrs', vdrMulti, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(4);
          expect(r.response.headers['elements-error']).to.be.undefined;
          vdrId = r.body.id;
          updatePayload = genUpdatePayload(vdrMulti, r.body.fields, 'organization');
        })
        .then(() => cloudWithOrgUser().get(`/vdrs/${vdrId}`, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(4);
          expect(r.response.headers['elements-error']).to.be.undefined;
        })
        .then(() => cloudWithOrgUser().get(`/vdrs`, pluralSchema))
        .then(() => cloudWithOrgUser().put(`/vdrs/${vdrId}`, updatePayload, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(5);
          expect(r.response.headers['elements-error']).to.be.undefined;
        })
        .then(() => cloudWithOrgUser().delete(`/vdrs/${vdrId}`))
        .then(r => {
          expect(r.response.headers['elements-error']).to.be.undefined;
        })
        .then(() => cloudWithOrgUser().get(`/vdrs/${vdrId}`, r => expect(r).to.have.statusCode(404)))
        .then(() => cloud.delete(`/users/${orgUser.id}/roles/org-admin`));
  });

  it('should support CRUDS for multi-level VDRs for user with AI privs', () => {
    let vdrId, updatePayload;
    return cloud.put(`/users/${acctUser.id}/roles/admin`) // account admin
        .then(() => cloudWithAcctUser().post('/vdrs', vdrMulti, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(3);
          expect(r.response.headers['elements-error']).to.contain('ignored');
          vdrId = r.body.id;
          updatePayload = genUpdatePayload(vdrMulti, r.body.fields, 'organization');
          updatePayload = genUpdatePayload(vdrMulti, updatePayload.fields, 'account');
        })
        .then(() => cloudWithAcctUser().get(`/vdrs/${vdrId}`, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(3);
        })
        .then(() => cloudWithAcctUser().get(`/vdrs`, pluralSchema))
        .then(() => cloudWithAcctUser().put(`/vdrs/${vdrId}`, updatePayload, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(4);
          expect(r.response.headers['elements-error']).to.contain('ignored');
        })
        .then(() => cloudWithAcctUser().delete(`/vdrs/${vdrId}`)) // can delete bc no org level fields
        .then(r => {
          expect(r.response.headers['elements-error']).to.be.undefined;
        })
        .then(() => cloudWithAcctUser().get(`/vdrs/${vdrId}`, r => expect(r).to.have.statusCode(404)))
        .then(() => cloud.delete(`/users/${acctUser.id}/roles/admin`));
  });

  it('should support CRUDS for multi-level VDRs for user with I privs', () => {
    let vdrId, updatePayload;
    return cloudWithAcctUser().post('/vdrs', vdrMulti, schema)
        .then(r => {
          expect(r.body.fields.length).to.equal(2);
          expect(r.response.headers['elements-error']).to.contain('ignored');
          vdrId = r.body.id;
          updatePayload = genUpdatePayload(vdrMulti, r.body.fields, 'organization');
          updatePayload = genUpdatePayload(vdrMulti, updatePayload.fields, 'account');
        })
        .then(() => cloudWithAcctUser().get(`/vdrs/${vdrId}`, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(2);
        })
        .then(() => cloudWithAcctUser().get(`/vdrs`, pluralSchema))
        .then(() => cloudWithAcctUser().put(`/vdrs/${vdrId}`, updatePayload, schema))
        .then(r => {
          expect(r.body.fields.length).to.equal(2);
          expect(r.response.headers['elements-error']).to.contain('ignored');
        })
        .then(() => cloudWithAcctUser().delete(`/vdrs/${vdrId}`)) // can delete bc no org or acct level fields
        .then(r => {
          expect(r.response.headers['elements-error']).to.be.undefined;
        })
        .then(() => cloudWithAcctUser().get(`/vdrs/${vdrId}`, r => expect(r).to.have.statusCode(404)));
  });

  it('should support changing the name of a VDR field', () => {
    const simpleVdr = {
      objectName: `churrosContact${tools.random()}`,
      fields: [
        {
          path: 'orgField',
          level: 'organization'
        }
      ]
    };
    
    let vdrId, updatePayload, fieldId;
    return cloud.post('/vdrs', simpleVdr)
        .then(r => {
            vdrId = r.body.id;
            fieldId = r.body.fields[0].id;
            updatePayload = r.body;
            updatePayload.fields[0].path = 'newName';
        })
        .then(() => cloud.put(`/vdrs/${vdrId}`, updatePayload))
        .then(() => cloud.get(`/vdrs/${vdrId}`))
        .then(r => {
          expect(r.body.fields[0].path).to.equal('newName');
          expect(r.body.fields[0].id).to.equal(fieldId);
          expect(r.body.fields.length).to.equal(1);
        })
        .then(() => cloud.delete(`/vdrs/${vdrId}`));
  });

});