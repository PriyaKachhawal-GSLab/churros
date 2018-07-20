'use strict';

const suite = require('core/suite');
const payload = require('./assets/creditcard-charges-create');
const cloud = require('core/cloud');
const updatePayload = require('./assets/creditcard-charges-update');

suite.forElement('finance', 'creditcard-charges', { payload: payload }, (test) => {
  it('should support CRUDS, pagination for /hubs/finance/creditcard-charges', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
