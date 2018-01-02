'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = require('./assets/newResource.json');

// Test for extending AutoTask FInance and invoking the extended resource
suite.forElement('finance', 'getThresholdAndUsageInfo', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.post(`elements/autotaskfinance/resources`, newResource)
    .then(r => newResourceId = r.body.id));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/autotaskfinance/resources/${newResourceId}`));

  it('should test newly added resource getThresholdAndUsageInfo', () => {
      return cloud.get(`getThresholdAndUsageInfo`)
      .then(r => {
        expect(r.body).to.not.be.empty;
      });
  });
});
