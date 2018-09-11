'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/payment-methods-create');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'payment-methods', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/payment-methods', () => {
    let id;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `active = 'true'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.active === true)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');

});
