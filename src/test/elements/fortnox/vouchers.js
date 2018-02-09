'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/voucher.json`);

suite.forElement('erp', 'vouchers', { payload: payload }, (test) => {
  let id;
  it(`should allow CRS operations for Vouchers`, () => {
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].id)
      .then(r => cloud.post(`${test.api}`, payload))
      //.then(r => cloud.get(`${test.api}/${id}`));
      .then(r => cloud.withOptions({ qs: { series: 'A' } }).get(`${test.api}/${id}`));
  });
  test.should.supportPagination();
});