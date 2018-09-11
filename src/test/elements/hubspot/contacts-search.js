'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/resources-create.json');

// Test for extending hubspot crm and invoking the extended resource
suite.forElement('crm', 'contacts-search', {}, (test) => {

  it('should test newly added account resource contacts-search', () => {
    const options = { qs: { where: "q='test'" } };
    let newResourceId;
    return cloud.post(`elements/hubspot/resources`, payload)
      .then(r => newResourceId = r.body.id)
      .then(r => cloud.withOptions(options).get(test.api))
      .then(r => expect(r.body.length).to.be.at.least(0))
      .then(r => cloud.delete(`elements/hubspot/resources/${newResourceId}`));
  });
});
