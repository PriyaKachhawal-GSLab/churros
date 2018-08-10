'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/payments-create');
const updatePayload = require('./assets/payments-update');

suite.forElement('finance', 'payments', (test) => {
  before(() => cloud.get(`/invoices`)
    .then(r => {
      payload.AppliedToTxn[0].TxnID = r.body[0].id;
      payload.CustomerRef.ListID = r.body[0].CustomerRef.ListID;
    }));
  it('should support CRUDS and Ceql searching for /hubs/finance/payments', () => {
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
  test.should.supportPagination('id');
});
