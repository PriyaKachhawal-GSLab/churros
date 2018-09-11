'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/sales-receipts-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/sales-receipts-create.json`);
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'sales-receipts', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/sales-receipts', () => {
    let id, totalamt;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
      totalamt = r.body.totalAmt;
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `totalAmt = '${totalamt}'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.totalAmt === `${totalamt}`)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`))
    .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
    .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');

});
