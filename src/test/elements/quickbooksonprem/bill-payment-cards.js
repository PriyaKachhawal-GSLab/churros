'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = require('./assets/bill-payment-cards');
const updatePayload = { "Memo": tools.random() };

//skipping the test as pagination is not proper from element itself.
suite.forElement('finance', 'bill-payment-cards', null, (test) => {
  it.skip('should support SRD for /hubs/finance/bill-payment-cards', () => {
    let id;
    let refno;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        refno = r.body.RefNumber;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});
