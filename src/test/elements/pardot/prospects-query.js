'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = require('./assets/prospects-queryNewResource-create.json');

// Test for extending hubspot crm and invoking the extended resource
suite.forElement('crm', 'prospects-query', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.post(`elements/pardot/resources`, newResource)
    .then(r => newResourceId = r.body.id));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/pardot/resources/${newResourceId}`));

  it('should test newly added resource prospects-query', () => {
      return cloud.get(`prospects-query`)
      .then(r => {
        expect(r.body).to.not.be.empty;
      });
  });
});
