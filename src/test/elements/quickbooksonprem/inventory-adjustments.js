'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/inventory-adjustments-create');
const updatePayload = require('./assets/inventory-adjustments-update');

suite.forElement('finance', 'inventory-adjustments', { payload: payload }, (test) => {
  it('should support CRUDS, pagination for /hubs/finance/inventory-adjustments', () => {
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
