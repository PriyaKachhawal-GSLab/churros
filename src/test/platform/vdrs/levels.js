'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const defaults = require('core/defaults');
const R = require('ramda');
const expect = require('chakram').expect;
const provisioner = require('core/provisioner');

const payload = tools.requirePayload(`${__dirname}/assets/vdr.system.json`);
const schema = tools.requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = tools.requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;

// NOTE: these tests assume your organization has upgraded to v2 VDRs

suite.forPlatform('level-vdr-apis', {payload, schema}, test => {
  let accountId, newAccount, newUser, closeioId, stripeId;
  before(function() {
      return cloud.get(`organizations/me`)
          .then(r => {
            // these tests are only supported for v2
            if (r.body.vdrVersion !== 'v2') { this.skip(); }
          })
          .then(() => cloud.get(`/accounts`))
          .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
          .then(() => {
              const account = { name: `${tools.random()}churros`, externalId: `${tools.random()}@cloud-elements.com`};
              return cloud.post(`/accounts`, account);
          })
          .then(r => newAccount = r.body)
          .then(() => {
            const user = { email: `churros+rbac${tools.random()}@churros.com`, firstName: 'frank', lastName: 'ricard', password: 'Bingobango1!' };
            return cloud.post(`/accounts/${newAccount.id}/users`, user);
          })
          .then(r => newUser = r.body)
          .then(() => cloud.put(`/users/${newUser.id}/roles/admin`))
          .then(() => provisioner.create('closeio'))
          .then(r => closeioId = r.body.id)
          .then(() => provisioner.create('stripe'))
          .then(r => stripeId = r.body.id);
  });

  after(() => {
    return cloud.delete(`/users/${newUser.id}`, R.always(true))
      .then(() => cloud.withOptions({ headers: { Authorization: `User ${defaults.secrets().userSecret}, Organization ${defaults.secrets().orgSecret}` } }).delete(`/accounts/${newAccount.id}`))
      .then(() => {
        if (closeioId) { provisioner.delete(closeioId); }
      });
  });

  const updatePayload = () => {
    let up = payload;
    up.fields = R.dropLast(1, up.fields);
    up.fields[0].path = 'anUpdateField';
    up.fields.push({type: 'string', path: 'aNewField', level: 'system'});
    return up;
  };

  const dictionary = {};
  dictionary[payload.objectName] = payload;

  const cloudWithUser = () => cloud.withOptions({ headers: { Authorization: `User ${newUser.secret}, Organization ${defaults.secrets().orgSecret}` } });

  // organizations
  it('should support CRUDS for organization level VDRs using the /organizations/objects/{objectName}/definitions APIs', () => {
    return cloud.post(`/organizations/objects/${payload.objectName}/definitions`, payload, schema)
        .then(() => cloud.get(`/organizations/objects/${payload.objectName}/definitions`, schema))
        .then(() => cloud.put(`/organizations/objects/${payload.objectName}/definitions`, updatePayload(), schema))
        .then(r => cloud.delete(`/organizations/objects/${payload.objectName}/definitions`));
  });

  it('should support CRD for organization level VDRs using the /organizations/objects/definitions APIs', () => {
    return cloud.post(`/organizations/objects/definitions`, dictionary)
        .then(() => cloud.get(`/organizations/objects/definitions`, r => expect(R.has(payload.objectName, r.body)).to.be.true))
        .then(r => cloud.delete(`/organizations/objects/definitions`))
        .then(() => cloud.get(`/organizations/objects/definitions`, r => expect(r).to.have.statusCode(404)));
  });

  // accounts
  it('should support CRUDS for account level VDRs using the /accounts/objects/{objectName}/definitions APIs', () => {
    return cloud.post(`/accounts/objects/${payload.objectName}/definitions`, payload, schema)
        .then(() => cloud.get(`/accounts/objects/${payload.objectName}/definitions`, schema))
        .then(() => cloud.put(`/accounts/objects/${payload.objectName}/definitions`, updatePayload(), schema))
        .then(r => cloud.delete(`/accounts/objects/${r.body.objectName}/definitions`));
  });

  it('should support CRD for account level VDRs using the /accounts/objects/definitions APIs', () => {
    return cloud.post(`/accounts/objects/definitions`, dictionary)
        .then(() => cloud.get(`/accounts/objects/definitions`, r => expect(R.has(payload.objectName, r.body)).to.be.true))
        .then(r => cloud.delete(`/accounts/objects/definitions`))
        .then(() => cloud.get(`/accounts/objects/definitions`, r => expect(r).to.have.statusCode(404)));
  });

  // accounts/{id}
  it('should support CRUDS for account level VDRs using the /accounts/{id}/objects/{objectName}/definitions APIs', () => {
    return cloud.post(`/accounts/${accountId}/objects/${payload.objectName}/definitions`, payload, schema)
        .then(() => cloud.get(`/accounts/${accountId}/objects/${payload.objectName}/definitions`, schema))
        .then(() => cloud.put(`/accounts/${accountId}/objects/${payload.objectName}/definitions`, updatePayload(), schema))
        .then(r => cloud.delete(`/accounts/${accountId}/objects/${r.body.objectName}/definitions`));
  });

  it('should support CRD for account level VDRs using the /accounts/{id}/objects/definitions APIs on v1 or v2', () => {
    return cloud.post(`/accounts/${accountId}/objects/definitions`, dictionary)
        .then(() => cloud.get(`/accounts/${accountId}/objects/definitions`, r => expect(R.has(payload.objectName, r.body)).to.be.true))
        .then(r => cloud.delete(`/accounts/${accountId}/objects/definitions`))
        .then(() => cloud.get(`/accounts/${accountId}/objects/definitions`, r => expect(r).to.have.statusCode(404)));
  });

  // instance
  it('should support CRUDS for instance level VDRs using the /instances/{id}/objects/{objectName}/definitions APIs', () => {
    return cloud.post(`/instances/${closeioId}/objects/${payload.objectName}/definitions`, payload, schema)
        .then(() => cloud.get(`/instances/${closeioId}/objects/${payload.objectName}/definitions`, schema))
        .then(() => cloud.get(`/instances/${closeioId}/objects/definitions`, r => expect(R.has(payload.objectName, r.body)).to.be.true))
        .then(() => cloud.put(`/instances/${closeioId}/objects/${payload.objectName}/definitions`, updatePayload(), schema))
        .then(r => cloud.delete(`/instances/${closeioId}/objects/${r.body.objectName}/definitions`));
  });

  // combination
  it('should support vdr fields for different levels and accounts and only return the correct fields', () => {
    const genObj = path => {
      return {
        fields: [
            {
                path,
                type: 'string'
            }
        ]
      };
    };

    const validate = path => r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.fields.length).to.equal(1);
        expect(r.body.fields[0].path).to.equal(path);
    };

    return cloud.post(`/organizations/objects/${payload.objectName}/definitions`, genObj('org'), validate('org'))
        .then(() => cloud.post(`/accounts/${accountId}/objects/${payload.objectName}/definitions`, genObj('acct1'), validate('acct1')))
        .then(() => cloudWithUser().post(`/accounts/${newAccount.id}/objects/${payload.objectName}/definitions`, genObj('acct2'), validate('acct2')))
        .then(() => cloud.post(`/instances/${closeioId}/objects/${payload.objectName}/definitions`,  genObj('instance'), validate('instance')))
        .then(() => cloud.post(`/instances/${stripeId}/objects/${payload.objectName}/definitions`, genObj('instance'), validate('instance')))
        .then(r => cloud.get(`/organizations/objects/${payload.objectName}/definitions`, validate('org')))
        .then(r => cloud.get(`/accounts/${accountId}/objects/${payload.objectName}/definitions`, validate('acct1')))
        .then(r => cloudWithUser().get(`/accounts/${newAccount.id}/objects/${payload.objectName}/definitions`, validate('acct2')))
        .then(r => cloud.delete(`/accounts/${accountId}/objects/${payload.objectName}/definitions`))
        .then(r => cloudWithUser().get(`/accounts/${newAccount.id}/objects/${payload.objectName}/definitions`, validate('acct2')))
        .then(() => cloud.get(`/instances/${closeioId}/objects/${payload.objectName}/definitions`, validate('instance')))
        .then(() => cloud.get(`/instances/${stripeId}/objects/${payload.objectName}/definitions`, validate('instance')))
        .then(() => cloud.delete(`/instances/${closeioId}/objects/${payload.objectName}/definitions`))
        .then(() => cloud.delete(`/instances/${stripeId}/objects/${payload.objectName}/definitions`))
        .then(r => cloud.delete(`organizations/objects/${payload.objectName}/definitions`))
        .then(r => cloudWithUser().delete(`/accounts/${newAccount.id}/objects/${payload.objectName}/definitions`));
  });

    // test that you can't create at the same level and name twice
    // test creating objects with the same name at different levels and that get and delete only gets/deletes the correct level
  it('should support organization, account and instance level definitions with the same name', () => {
    return cloud.post(`/organizations/objects/${payload.objectName}/definitions`, payload, schema)
        .then(() => cloud.post(`/organizations/objects/${payload.objectName}/definitions`, payload, r => expect(r).to.have.statusCode(409)))
        .then(() => cloud.post(`/accounts/objects/${payload.objectName}/definitions`, payload, schema))
        .then(r => cloud.delete(`/accounts/objects/${payload.objectName}/definitions`))
        .then(r => cloud.get(`/accounts/objects/${payload.objectName}/definitions`, r => expect(r).to.have.statusCode(404)))
        .then(r => cloud.get(`/organizations/objects/${payload.objectName}/definitions`, schema))
        .then(r => cloud.delete(`/organizations/objects/${payload.objectName}/definitions`))
        .then(r => cloud.get(`/organizations/objects/${payload.objectName}/definitions`, r => expect(r).to.have.statusCode(404)));
  });
});
