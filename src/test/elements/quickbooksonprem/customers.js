'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/customers-create');
const updatePayload = require('./assets/customers-update');

suite.forElement('finance', 'customers', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/customers', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});
