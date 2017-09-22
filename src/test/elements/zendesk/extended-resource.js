'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = require('./assets/newResource.json');

// Test for extending hubspot crm and invoking the extended resource
suite.forElement('helpdesk', 'extended-resource', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.post(`elements/helpdesk/resources`, newResource)
    .then(r => newResourceId = r.body.id));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/helpdesk/resources/${newResourceId}`));

  it('should test newly added account resource extended-resource', () => {
      return cloud.get(`extended-resource`)
      .then(r => {
        expect(r.body).to.not.be.empty;
      });
  });
});
