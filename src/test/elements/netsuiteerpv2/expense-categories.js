'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expenseCategoryPayload = require('./assets/expense-categories');


suite.forElement('erp', 'expense-categories', (test) => {
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  it('should allow CRUDS /hubs/erp/expense-categories', () => {
    let internalId;
    return cloud.post(test.api, expenseCategoryPayload)
      .then(r => internalId = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${internalId}`))
      .then(r => cloud.patch(`${test.api}/${internalId}`, {}))
      .then(r => cloud.delete(`${test.api}/${internalId}`));
  });
});
