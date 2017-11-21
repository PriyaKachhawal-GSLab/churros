'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/company');
const updatePayload = {};
//Skipping the test since Delete is not supported for this Company resource.
suite.forElement('crm', 'company', { payload: payload }, (test) => {
  it.skip('should support CRUDS for company', () => {
    let companyId;
    return cloud.post(test.api, payload)
      .then(r => companyId = r.body.changedEntityId)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${companyId}`))
      .then(r => cloud.patch(`${test.api}/${companyId}`, updatePayload));


  });
  test.should.supportPagination();
});
