'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/invoices-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/invoices-update.json`);
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;

suite.forElement('finance', 'invoices', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/invoices', () => {
    let id, totalamt;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
      totalamt=r.body.totalAmt;
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `totalAmt = '${totalamt}'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.totalAmt == `${totalamt}`)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`))
    .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
    .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');
});

