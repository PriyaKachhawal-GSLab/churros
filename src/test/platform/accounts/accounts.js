'use strict';

const account = require('./assets/account');
const accountSchema = require('./assets/account.schema');
const roleSchema = require('./assets/role.schema');
const rolesSchema = require('./assets/roles.schema');
const accountsSchema = require('./assets/accounts.schema');
const chakram = require('chakram');
const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forPlatform('accounts', { payload: account, schema: accountSchema }, (test) => {

  test.should.supportCrud();
  test.withOptions({ schema: accountsSchema }).should.supportS();
  test.should.supportCeqlSearch('name');
  test.should.return404OnDelete(-1);
  test.should.return404OnPatch(-1);
  test.should.return404OnGet(-1);

  describe('account roles', () => {
    let accountId;
    before(() => {
      return cloud.post(`/accounts/`, account)
        .then(r => {
          accountId = r.body.id;
        });
    });

    it('should support U', () => {
      const newName1 = 'Updated Name 1';
      const newName2 = 'Updated Name 2';
      const newExternalId = 'External ID 1';
      const newDescription = 'New Description';
      const patch = {
        name: newName1
      };
      const put = {
        name: newName2,
        externalId: newExternalId,
        description: 'New Description'
      };

      const api = `/accounts/${accountId}`;
      return cloud.patch(`${api}`, patch)
      .then(r => cloud.get(`${api}`))
      .then(r => expect(r.body.name).to.equal(newName1))
      .then(r => cloud.put(`${api}`, put))
      .then(r => expect(r.body.name).to.equal(newName2) && expect(r.body.description).equals(newDescription) && expect(r.body.externalId).to.equal(newExternalId));
    });

    it('should support CRD of roles for own account', () => {
      const api = `/accounts/${accountId}/roles`;
      return cloud.put(`${api}/admin`, null, roleSchema)
       .then(r => cloud.get(api, rolesSchema))
       .then(r => expect(r.body.length).to.equal(1) && expect(r.body[0].key).to.equal('admin'))
       .then(r => cloud.delete(`${api}/admin`));
    });

    it('should not support CRD of roles for other org\'s account', () => {
      const api = `/accounts/1/roles`;
      return cloud.put(`${api}/admin`, null, r => {
         expect(r).to.have.statusCode(403);
       })
      .then(r => cloud.delete(`${api}/admin`, r => {
         expect(r).to.have.statusCode(403);
      }));
    });

    /* 404 on PUT where account does not exist */
    test
      .withApi('/accounts/-1/roles/admin')
      .should.return404OnPut();

    /* 403 on PUT where account does not belong in user's org
    NOTE: Don't run this test as the system user. */
    test
      .withApi('/accounts/1/roles/admin')
      .should.return403OnPut();

    it('should return a 403 on PUT where user does not have permission to grant the role', () => {
      cloud.put(`/accounts/${accountId}/roles/sys-admin`, null, r => {
        expect(r).to.have.statusCode(403);
      });
    });

    /* 400 on PUT where role does not exist */
    test
      .withApi('/accounts/1/roles/foo')
      .should.return400OnPut();
  });

  after(() =>
    chakram.get('/accounts')
    .then(r => Promise.all(r.body.filter(a => !a.defaultAccount).map(a => chakram.delete(`/accounts/${a.id}`))))
  );
});
