'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const props = require('core/props');
const defaults = require('core/defaults');
const provisioner = require('core/provisioner');
const schema = require('./assets/users.schema');
const roleSchema = require('./assets/role.schema');
const rolesSchema = require('./assets/roles.schema');
const expect = require('chakram').expect;
const moment = require('moment');
const payload = {
  firstName: 'frank',
  lastName: 'ricard',
  email: 'frank@churros.com',
  password: 'Passw0rd!'
};

const payload2 = {
  firstName: 'bernard',
  lastName: 'campbell',
  email: 'bernard@churros.com',
  password: 'Passw0rd!'
};

const payloadWithRoles = {
  firstName: 'frank',
  lastName: 'ricard',
  email: 'frankwithroles@churros.com',
  password: 'Passw0rd!',
  roles: [
    {
      key: 'sys-admin'
    },
    {
      key: 'org-admin'
    }
  ]
};

const updatePayload = {
  firstName: 'joseph',
  lastName: 'pulaski'
};

suite.forPlatform('users', { schema: schema, payload: payload }, (test) => {
  const cleanup = () => {
    return cloud.get(`/users`)
      .then(r => {
        const usersToDelete = r.body.filter(user => user.email === payload.email || user.email === payloadWithRoles.email || user.email === payload2.email);
        return usersToDelete ?
          Promise.all(usersToDelete.map(u => cloud.delete(`/users/${u.id}`))) :
          true;
      });
  };

  let accountId, userId, currUserId, orgSecret;
  before(() => {
    return cleanup()
      .then(r => cloud.get(`/accounts`))
      .then(r => accountId = r.body.filter(account => account.defaultAccount)[0].id)
      .then(r => cloud.post(`/accounts/${accountId}/users`, payload, schema))
      .then(r => { expect(r.body).to.have.property('roles'); userId = r.body.id; })
      .then(() => cloud.get(`/organizations/me`))
      .then(r => orgSecret = r.body.secret)
      .then(() => cloud.get(`/users`))
      .then(r => currUserId = r.body.filter(u => u.email === props.get('user'))[0].id);
  });

  after(() => cleanup());

  afterEach(() => { defaults.reset(); return cleanup(); });

  it('should support CRUDS for users', () => {
    const validate = (r, amount, firstName, lastName, email) => {
      firstName = firstName || payload.firstName;
      lastName = lastName || payload.lastName;
      email = email || payload.email;
      expect(r.body.length).to.be.above(0);
      expect(r.body.filter(user => user.email === email && user.firstName === firstName && user.lastName === lastName).length).to.equal(amount);
      const today = moment().format('YYYY[-]MM[-]DD');
      const loggedInUser = r.body.find(user => user.email === props.get('user'));
      expect(loggedInUser.lastLoginDate).to.equal(today);
    };

    const validatePatch = (r) => {
      expect(r.body.firstName).to.equal(updatePayload.firstName);
      expect(r.body.lastName).to.equal(updatePayload.lastName);
      expect(r.body.email).to.equal(payload.email);
    };

    return cloud.get(`/users`)
      .then(r => validate(r, 1))
      .then(r => cloud.patch(`/users/${userId}`, Object.assign({}, payload, updatePayload)))
      .then(r => validatePatch(r))
      .then(r => cloud.delete(`/users/${userId}`))
      .then(r => cloud.get(`/users`))
      .then(r => validate(r, 0, updatePayload.firstName, updatePayload.lastName));
  });

  it('should keep instances for non-permanent user deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, payload2)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the user "non-permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/users/${userId}`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the user
    .then(() => cloud.patch(`/users/${userId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the instance no longer exists for that user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1));
  });

  it('should delete instances for permanent user deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, payload2)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the user "permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/users/${userId}?permanent=true`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the user
    .then(() => cloud.patch(`/users/${userId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the instance no longer exists for that user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload.email))
    .then(() => cloud.get(`/instances`, r => expect(r).to.have.status(404)));
  });

  it('should delete jobs for non-permanent user deactivation', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, payload2)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => provisioner.create('sfdc', null, null, true))
    // Validate that the instance and job is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    .then(() => cloud.get(`/jobs`))
    .then(r => expect(r.body.length).to.equal(1))
    // Deactivate the user "non-permanently"
    .then(() => defaults.reset())
    .then(() => cloud.patch(`/users/${userId}`, { active: false }))
    .then(r => expect(r.body.active).to.be.false)
    // Reactivate the user
    .then(() => cloud.patch(`/users/${userId}`, { active: true }))
    .then(r => expect(r.body.active).to.be.true)
    // Validate that the job no longer exists for that user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload.email))
    .then(() => cloud.get(`/jobs`))
    .then(r => expect(r.body.length).to.equal(0));
  });


  it('should support user deletion', () => {
    let userSecret;
    let userId;
    return cloud.post(`/accounts/${accountId}/users`, payload2)
    .then(r => { userSecret = r.body.secret; userId = r.body.id; })
    // Create a pipedrive instance with the new user's credentials
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => provisioner.create('pipedrive'))
    // Validate that the instance is there for the new user
    .then(() => defaults.withDefaults(userSecret, orgSecret, payload2.email))
    .then(() => cloud.get(`/instances`))
    .then(r => expect(r.body.length).to.equal(1))
    // Delete the user
    .then(() => defaults.reset())
    .then(() => cloud.delete(`/users/${userId}`));
  });

  describe('user roles', () => {
    before(() => {
      return cleanup()
        .then(r => cloud.get(`/accounts`))
        .then(r => accountId = r.body.filter(account => account.defaultAccount)[0].id)
        .then(r => cloud.post(`/accounts/${accountId}/users`, payload, schema))
        .then(r => userId = r.body.id);
    });

    it('should support CRD of admin role for user in own account', () => {
      const api = `/users/${userId}/roles`;
      const isAdmin = r => r.key === 'admin';
      return cloud.put(`${api}/admin`, null, roleSchema)
        .then(r => cloud.get(api, rolesSchema))
        .then(r => expect(r.body.filter(isAdmin).length).to.equal(1))
        .then(r => cloud.delete(`${api}/admin`))
        .then(r => cloud.get(api))
        .then(r => expect(r.body.filter(isAdmin).length).to.equal(0));
    });

    it('should not support CRD of roles for user in other account', () => {
      const api = `/users/1/roles`;
      return cloud.put(`${api}/admin`, null, r => expect(r).to.have.statusCode(403))
      .then(() => cloud.get(`${api}`, r => expect(r).to.have.statusCode(403)))
      .then(() => cloud.delete(`${api}/admin`, r => expect(r).to.have.statusCode(403)));
    });

    it('should not support CD of roles for current user', () => {
      const api = `/users/${currUserId}/roles`;
      return cloud.put(`${api}/admin`, null, r => expect(r).to.have.statusCode(403))
      .then(() => cloud.delete(`${api}/admin`, r => expect(r).to.have.statusCode(403)));
    });

    test
      .withApi('/users/-1/roles/admin')
      .should.return404OnPut();

    it('should return a 403 on PUT where user does not have permission to grant the role', () => {
      cloud.put(`/users/${userId}/roles/sys-admin`, null, r => {
        expect(r).to.have.statusCode(403);
      });
    });

    it('should return a 403 on PUT where user does not have permission to grant the role', () => {
      cloud.put(`/users/1/roles/admin`, null, r => {
        expect(r).to.have.statusCode(403);
      });
    });

    it('should return a 400 on PUT with an invalid role', () => {
      cloud.put(`/users/1/roles/foo`, null, r => {
        expect(r).to.have.statusCode(400);
      });
    });

    it('should return a 409 on two PUTs with the same user and role', () => {
      cloud.put(`/users/${userId}/roles/admin`, null, roleSchema)
        .then(r => cloud.put(`/users/${userId}/roles/admin`, null, r => {
          expect(r).to.have.statusCode(409);
        }))
        .then(r => cloud.delete(`/users/${userId}/roles/admin`));
    });

    it('should not allow creation of a user with higher roles', () => {
      return cloud.post(`/accounts/${accountId}/users`, payloadWithRoles, r => {
        expect(r).to.have.statusCode(403);
      });
    });
  });
});
