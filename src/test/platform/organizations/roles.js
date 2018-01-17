'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const R = require('ramda');

/**
 * Assuming that person running these tests is an organization admin.  If they're not, then you can't run these.
 */
suite.forPlatform('organizations/roles', test => {
  let snapshotOrgRoles;
  before(() => {
    return cloud.get('/organizations/roles').then(r => {
      expect(r.body).to.have.length.above(0);
      snapshotOrgRoles = r.body;
    });
  });

  after(() => R.isNil(snapshotOrgRoles) ? null : cloud.put('/organizations/roles', snapshotOrgRoles));

  it('should allow modifying and resetting the organization roles', () => {
    let defaults;
    const modifyAccountRole = role => {
      return role.name !== 'Account' ? role : {
        id: role.id,
        name: role.name,
        active: role.active,
        description: role.description,
        privileges: []
      };
    };
    return cloud.put('/organizations/roles/reset')
      .then(() => cloud.get('/organizations/roles'))
      .then(r => defaults = r.body)
      .then(() => cloud.put('/organizations/roles', defaults.map(modifyAccountRole)))
      .then(() => cloud.get('/organizations/roles'))
      .then(r => {
        const accountRole = R.find(R.propEq('name', 'Account'))(r.body);
        expect(accountRole.privileges).to.be.empty;
      })
      .then(() => cloud.put('/organizations/roles/reset'))
      .then(() => cloud.get('/organizations/roles'))
      .then(r => expect(r.body).to.deep.equal(defaults));
  });

  it('should not allow adding internal privileges to a role', () => {
    let defaults, defaultUserRole;
    const modifyAccountRole = role => {
      return role.name !== 'Account' ? role : {
        id: role.id,
        key: role.key,
        name: role.name,
        active: role.active,
        description: role.description,
        privileges: [{
          key: 'system'
        }]
      };
    };

    const badSystemValidator = r => {
      expect(r).to.have.statusCode(403);
      expect(r.body.message).to.equal("User can not add the 'system' privilege to any role.");
    };

    const badIntelligencealidator = r => {
      expect(r).to.have.statusCode(403);
      expect(r.body.message).to.equal("User can not add the 'intelligence' privilege to the 'default-user' role.");
    };

    return cloud.put('/organizations/roles/reset')
      .then(() => cloud.get('/organizations/roles'))
      .then(r => {
        defaults = r.body;
        defaultUserRole = R.clone(R.head(R.filter(R.propEq('key', 'default-user'), r.body)));
        defaultUserRole.privileges = [{
          key: 'intelligence'
        }];
      })
      .then(() => cloud.put('/organizations/roles', defaults.map(modifyAccountRole), badSystemValidator))
      .then(() => cloud.put(`/organizations/roles/${defaultUserRole.id}`, defaultUserRole, badIntelligencealidator))
      .then(() => cloud.get('/organizations/roles'))
      .then(r => expect(r.body).to.deep.equal(defaults));
  });
});
