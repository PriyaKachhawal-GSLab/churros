'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/time-activities-create');
const updatePayload2 = require('./assets/time-activities-update');

const updatePayload = (editseq) => ({
  "BillableStatus": "Billable",
  "EditSequence": editseq,
  "Duration": "PT12H00M",
  "EntityRef": {
    "FullName": "Elizabeth N. Mason"
  },
  "Notes": "Single activity time sheet Update",
  "TxnNumber": "0"
});

suite.forElement('finance', 'time-activities', { payload: payload }, (test) => {
  it('should support CRUDS for /hubs/finance/time-activities', () => {
    let id, editseq;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        updatePayload2.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload2))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});
