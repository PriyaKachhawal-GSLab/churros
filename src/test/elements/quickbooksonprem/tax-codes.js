'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

const payload = require('./assets/tax-codes-create');
const updatePayload = require('./assets/tax-codes-update');

suite.forElement('finance', 'tax-codes', { payload: payload }, (test) => {
  it('should support CRUDS, pagination and Ceql searching for /hubs/finance/tax-codes', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
