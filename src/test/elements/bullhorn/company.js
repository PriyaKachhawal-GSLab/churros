'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/company.json`);

const updatePayload = {};
//Skipping the test since Delete is not supported for this Company resource.
suite.forElement('crm', 'companies', { payload: payload }, (test) => {
  it.skip('should support CRUDS for company', () => {
    let companyId;
    return cloud.post(test.api, payload)
      .then(r => companyId = r.body.changedEntityId)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${companyId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'id,department.name' } }).get(`${test.api}/${companyId}`))
      .then(r => cloud.patch(`${test.api}/${companyId}`, updatePayload));


  });
  test.should.supportPagination();
});
