'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/item-receipts.json`);
const updatePayload = { "Memo": tools.random() };

suite.forElement('finance', 'item-receipts', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/item-receipts', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.TxnID;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});
