'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/sales-orders-create');
const updatePayload = require('./assets/sales-orders-update');


suite.forElement('finance', 'sales-orders', { payload: payload }, (test) => {
  it('should support CRUDS, pagination and Ceql searching for /hubs/finance/sales-orders', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
