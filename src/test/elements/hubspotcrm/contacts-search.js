'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = require('./assets/resources-create.json');
const queryType = require('./assets/contactsSearch-queryType.json');

// Test for extending hubspot crm and invoking the extended resource
suite.forElement('crm', 'contacts-search', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.post(`elements/hubspotcrm/resources`, newResource)
    .then(r => newResourceId = r.body.id));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/hubspotcrm/resources/${newResourceId}`));

  it('should test newly added account resource contacts-search', () => {
      const options = { qs: queryType };
      return cloud.withOptions(options).get(`contacts-search`)
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.undefined;
      });
  });
});
