'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expenseReportsPayload = require('./assets/expense-reports');


suite.forElement('erp', 'expense-reports', (test) => {
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  it('should allow CRUDS /hubs/erp/expense-reports', () => {
    let internalId;
    return cloud.post(test.api, expenseReportsPayload)
      .then(r => internalId = r.body.internalId)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${internalId}`))
      .then(r => cloud.patch(`${test.api}/${internalId}`, {}))
      .then(r => cloud.delete(`${test.api}/${internalId}`));
  });
});
