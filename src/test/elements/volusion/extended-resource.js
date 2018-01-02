'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = require('./assets/newResource.json');

// Test for extending volusion and invoking the extended resource
suite.forElement('ecommerce', 'extended-resource', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.post(`elements/volusion/resources`, newResource)
    .then(r => newResourceId = r.body.id));

  //delete new/override resource should work fine
  after(() => cloud.delete(`elements/volusion/resources/${newResourceId}`));

  it('should test newly added  resource', () => {
      return cloud.withOptions({ qs: { resource_name: `Generic\\all_products` } }).get(`extended-resource`)
      .then(r => {
        expect(r.body).to.not.be.empty;
      });
  });
});

