'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = require('./assets/newResource.json');

// Test for extending sfdc service cloud and invoking the extended resource
suite.forElement('helpdesk', 'getThresholdAndUsageInfo', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.post(`elements/sfdcservicecloud/resources`, newResource)
    .then(r => newResourceId = r.body.id));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/sfdcservicecloud/resources/${newResourceId}`));

  it('should test newly added account resource getThresholdAndUsageInfo', () => {
      return cloud.get(`getThresholdAndUsageInfo`)
      .then(r => {
        expect(r.body).to.not.be.empty;
      });
  });
});
