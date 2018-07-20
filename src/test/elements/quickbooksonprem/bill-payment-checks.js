'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = require('./assets/bill-payment-checks-create');
const updatePayload = require('./assets/bill-payment-checks-update');


suite.forElement('finance', 'bill-payment-checks', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/bill-payment-checks', () => {
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
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
