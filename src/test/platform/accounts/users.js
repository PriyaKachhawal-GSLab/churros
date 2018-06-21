'use strict';

const cloud = require('core/cloud');
const defaults = require('core/defaults');
const provisioner = require('core/provisioner');
const chakram = require('chakram');
const expect = chakram.expect;
const account = require('./assets/account');
const user = require('./assets/user');
const R = require('ramda');

describe('account users', () => {
  let accountId;
  let orgSecret;

  const account2 = {
    "externalId": "enchiladas@cloud-elements.com",
    "name": "enchiladas"
  };

  before(() => {
    return chakram.get(`/organizations/users/${user.email}`)
    .then(r => chakram.delete(`/organizations/users/${r.body.id}`))
    .then(() => chakram.get(`/accounts`))
    .then(r => Promise.all(
      R.pipe(
        R.filter(a => !a.defaultAccount),
        R.map(a => chakram.delete(`/accounts/${a.id}`))
      )(r.body)))
    .then(() => cloud.post(`/accounts/`, account))
    .then(r => accountId = r.body.id)
    .then(() => chakram.get(`/organizations/me`))
    .then(r => orgSecret = r.body.secret);
  });

  it('should return 409 when trying to create a duplicate user', () => {
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => userId = r.body.id)
    .then(() => cloud.post(`/accounts/${accountId}/users`, user, r => {
      expect(r).to.have.status(409);
    }));
  });

  it('should return 400 when trying to create a user with blank payload', () => {
    return cloud.post(`/accounts/${accountId}/users`, {}, r => expect(r).to.have.status(400));
  });

  it('should support U', () => {
    const newExternalId = 'new-ext-id';
    const newCity = 'Anytown';
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => { userId = r.body.id; return r; })
    .then(r => expect(r.body.active).to.be.true)
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}`, { externalId: newExternalId }))
    .then(r => { expect(r.body.externalId).to.equal(newExternalId); return r; })
    .then(r => {
      r.body.city = newCity;
      return cloud.put(`/accounts/${accountId}/users/${userId}`, r.body);
    })
    .then(r => expect(r.body.city).to.equal(newCity));
  });

  it('should support deactivating and reactivating a user', () => {
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => { userId = r.body.id; return r; })
    .then(r => expect(r.body.active).to.be.true)
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true);
  });

  it('should delete jobs for account deactivation', () => {
    let acctId;
    let userId;
    let userSecret;

    return cloud.post(`/accounts/`, account2)
    .then(r => acctId = r.body.id)
    .then(() => cloud.post(`/accounts/${acctId}/users`, user))
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => provisioner.create('sfdc', null, null, true))
    // Validate that the instance and job is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/jobs`))
    .then(r => expect(r.body.length).to.equal(1))
    // Disable the account "non-permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/accounts/${acctId}`, { active: false }))
    // Validate that the account is inactive
    .then(r => expect(r.body.active).to.equal(false))
    // Reactivate the account
    .then(() => cloud.patch(`/accounts/${acctId}`, { active: true }))
    .then(() => cloud.get(`/accounts`))
    .then(r => expect(r.body.filter(a => a.externalId === account2.externalId).length).to.equal(1))
    // Reactivate the user
    .then(() => cloud.patch(`/accounts/${acctId}/users/${userId}`, { active: true }))
    // Validate that the job been deleted
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/jobs`))
    .then(r => expect(r.body.length).to.equal(0))
    // Clean up after ourselves
    .then(() => defaults.reset())
    .then(() => cloud.delete(`/accounts/${acctId}`));
  });

  it('should delete instances and users for account deletion', () => {
    let acctId;
    let userId;
    let userSecret;
    let instanceId;

    return cloud.post(`/accounts/`, account2)
    .then(r => acctId = r.body.id)
    .then(() => cloud.post(`/accounts/${acctId}/users`, user))
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => provisioner.create('pipedrive'))
    .then(r => instanceId = r.body.id)
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Delete the account "permanently"
    .then(() => defaults.reset())
    .then(() => cloud.delete(`/accounts/${acctId}`))
    // Validate that the account is deleted
    .then(() => cloud.get(`/accounts`))
    .then(r => expect(r.body.filter(a => a.externalId === account2.externalId).length).to.equal(0))
    // Reactivate the account
    .then(() => cloud.patch(`/accounts/${acctId}`, { active: true }))
    .then(() => cloud.get(`/accounts`))
    .then(r => expect(r.body.filter(a => a.externalId === account2.externalId).length).to.equal(1))
    // Validate the the user was deleted
    .then(() => cloud.get(`/accounts/${acctId}/users/${userId}`, r => expect(r).to.have.status(404)))
    // Clean up after ourselves
    .then(() => cloud.delete(`/accounts/${acctId}`));
  });

  it('should keep instances for non-permanent user deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the user "non-permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the user
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the instance no longer exists for that user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1));
  });

  it('should delete instances for permanent user deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the user "permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}?permanent=true`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the user
    .then(() => cloud.patch(`/accounts/${accountId}/users/${userId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the instance no longer exists for that user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`, r => expect(r).to.have.status(404)));
  });

  it('should keep instances for non-permanent account deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the account "non-permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/accounts/${accountId}`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the account
    .then(() => cloud.patch(`/accounts/${accountId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the instance still exists for that user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1));
  });

  it('should delete instances and users for permanent account deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, user)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, user.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the account "permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/accounts/${accountId}?permanent=true`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the account
    .then(() => cloud.patch(`/accounts/${accountId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the user no longer exists
    .then(() => cloud.get(`/accounts/${accountId}/users/${userId}`, r => expect(r).to.have.status(404)));
  });

  afterEach(() => {
    defaults.reset();
    return chakram.get(`/organizations/users/${user.email}`)
    .then(r => chakram.delete(`/organizations/users/${r.body.id}`));
  });

  after(() => {
    return cloud.get(`/accounts`)
    .then(r => Promise.all(r.body.filter(a => !a.defaultAccount).map(a => chakram.delete(`/accounts/${a.id}`))));
  });
});
