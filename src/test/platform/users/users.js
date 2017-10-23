'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const schema = require('./assets/users.schema');
const roleSchema = require('./assets/role.schema');
const rolesSchema = require('./assets/roles.schema');
const expect = require('chakram').expect;
const props = require('core/props');
const payload = {
  firstName: 'frank',
  lastName: 'ricard',
  email: 'frank@oldschool.com',
  password: 'Passw0rd!'
};

const payloadWithRoles = {
  firstName: 'frank',
  lastName: 'ricard',
  email: 'frankwithroles@oldschool.com',
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
        const usersToDelete = r.body.filter(user => user.email === payload.email || user.email === payloadWithRoles.email);
        return usersToDelete ?
          Promise.all(usersToDelete.map(u => cloud.delete(`/users/${u.id}`))) :
          true;
      });
  };

  let accountId, userId, currUserId;
  before(() => {
    return cleanup()
      .then(r => cloud.get(`/accounts`))
      .then(r => accountId = r.body.filter(account => account.defaultAccount)[0].id)
      .then(r => cloud.post(`/accounts/${accountId}/users`, payload, schema))
      .then(r => { expect(r.body).to.have.property('roles'); userId = r.body.id; })
      .then(() => cloud.get(`/users`))
      .then(r => currUserId = r.body.filter(u => u.email === props.get('user'))[0].id);
  });

  after(() => cleanup());

  it('should support CRUDS for users', () => {
    const validate = (r, amount, firstName, lastName) => {
      firstName = firstName || payload.firstName;
      lastName = lastName || payload.lastName;
      expect(r.body.length).to.be.above(0);
      expect(r.body.filter(user => user.firstName === firstName && user.lastName === lastName).length).to.equal(amount);
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
