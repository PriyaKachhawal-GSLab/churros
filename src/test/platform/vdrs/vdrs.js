'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const R = require('ramda');

const vdrSystem = require('core/tools').requirePayload(`${__dirname}/assets/vdr.system.json`);
const vdrMulti = require('core/tools').requirePayload(`${__dirname}/assets/vdr.multi.json`);
const vdrMultiWithSystem = require('core/tools').requirePayload(`${__dirname}/assets/vdr.extend.json`);
const schema = require('core/tools').requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = require('core/tools').requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;

suite.forPlatform('vdrs', {payload: vdrSystem, schema}, test => {

  let newUser;
    before(() => {
      const opts = { qs: { where: 'defaultAccount=true' } };
      return cloud.withOptions(opts).get('/accounts')
        .then(r => {
          expect(r.body.length).to.equal(1);
          const user = { email: `churros+vdrs${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'Bingobango1!' };
          return cloud.post(`/accounts/${r.body[0].id}/users`, user);
        })
        .then(r => {
          newUser = r.body;
        })
        .then(() => cloud.put(`/users/${newUser.id}/roles/org-admin`)); // give them the org admin role to start so they can manage org, acct and instance levels
    });

  const cloudWithUser = () => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } });

  const genUpdatePayload = (payload, fields, newFieldLevel) => {
    let up = R.assoc('objectName', 'updatedObjectName2', payload);
    up.fields = fields;
    up.fields = R.dropLast(1, up.fields);
    up.fields[0].path = 'anUpdateField';
    up.fields.push({type: 'string', path: 'aNewField', level: newFieldLevel});
    return up;
  };

  // NOTE - you need the 'vdrAdmin' role to run these tests
  it('should support CRUDS for system VDRs', () => {
    let vdrId, updatePayload;
    return cloud.post('/vdrs', vdrSystem, schema)
        .then(r => {
            vdrId = r.body.id;
            updatePayload = genUpdatePayload(vdrSystem, r.body.fields, 'system');
        })
        .then(() => cloud.get(`/vdrs/${vdrId}`, schema))
        .then(() => cloud.get(`/vdrs`, pluralSchema))
        .then(() => cloud.put(`/vdrs/${vdrId}`, updatePayload, schema))
        .then(() => cloud.delete(`/vdrs/${vdrId}`));
  });

  it('should support CRUDS for multi-level VDRs', () => {
    let vdrId, updatePayload;
    return cloudWithUser.post('/vdrs', vdrMulti, schema)
        .then(r => {
            vdrId = r.body.id;
            updatePayload = genUpdatePayload(vdrMulti, r.body.fields, 'organization');
        })
        .then(() => cloudWithUser.get(`/vdrs/${vdrId}`, schema))
        .then(() => cloudWithUser.get(`/vdrs`, pluralSchema))
        .then(() => cloudWithUser.put(`/vdrs/${vdrId}`, updatePayload, schema)) //todo - add more validation here
        .then(() => cloudWithUser.delete(`/vdrs/${vdrId}`));
  });

  // todo - only org admin change org
  // todo - only acct admin change acct
  // todo - any other user change instance
  // todo - multi with sys but dont change sys if they don't have permission
  // todo - test updating the field path
});
