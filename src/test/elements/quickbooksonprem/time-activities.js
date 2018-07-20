'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/time-activities-create');
const updatePayload = require('./assets/time-activities-update');

suite.forElement('finance', 'time-activities', { payload: payload }, (test) => {
  it('should support CRUDS for /hubs/finance/time-activities', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});
