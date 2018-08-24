'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/sales-receipts-create');
const updatePayload = require('./assets/sales-receipts-update');

suite.forElement('finance', 'sales-receipts', { payload: payload }, (test) => {
  it('should support CRUDS, pagination and Ceql searching for /hubs/finance/sales-receipts', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TimeModified>='2017-01-05'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.TimeModified >= `2017-01-05`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
  test.should.supportPagination('id');
});
