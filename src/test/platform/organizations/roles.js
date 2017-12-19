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
});
