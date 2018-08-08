'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/item-receipts-create');
const updatePayload = require('./assets/item-receipts-update');

suite.forElement('finance', 'item-receipts', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/item-receipts', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(2);
  test.should.supportPagination('id');
});
