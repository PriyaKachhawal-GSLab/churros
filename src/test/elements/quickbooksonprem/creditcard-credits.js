'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const payload = require('./assets/creditcard-credits-create');
const updatePayload = require('./assets/creditcard-credits-update');
const cloud = require('core/cloud');

suite.forElement('finance', 'creditcard-credits', { payload: payload }, (test) => {
  it('should support CRUDS, pagination for /hubs/finance/creditcard-credits', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber = '12345'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.RefNumber === `12345`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
