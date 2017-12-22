'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/payments.json`);
const updatePayload = { "Memo": tools.random(), "TotalAmount": "136.00" };

suite.forElement('finance', 'payments', (test) => {
  let invoiceTxnId, invoiceCustomerRef;
  before(() => cloud.get(`/invoices`)
    .then(r => {
      invoiceTxnId = r.body[0].id;
      invoiceCustomerRef = r.body[0].CustomerRef.ListID;
    }));
  it('should support CRUDS and Ceql searching for /hubs/finance/payments', () => {
    let id;
    payload.CustomerRef.ListID = invoiceCustomerRef;
    payload.AppliedToTxn[0].TxnID = invoiceTxnId;
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
  test.should.supportPagination();
});
