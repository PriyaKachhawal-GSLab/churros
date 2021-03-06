'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

const payload = tools.requirePayload(`${__dirname}/assets/deposits.json`);
const SalesPayload = tools.requirePayload(`${__dirname}/assets/salesReceipts.json`);

suite.forElement('finance', 'deposits', { payload: payload }, (test) => {
  before(() => cloud.post('/hubs/finance/sales-receipts', SalesPayload)
    .then(r => payload.receiptkeys.receiptkey[0] = r.body.id));
  test.should.supportSr();
  it(`should allow CRUDS for ${test.api}`, () => {
    let Did;
    return cloud.post(test.api, payload)
           .then(r=> cloud.get(`${test.api}`)
           .then(r => Did =r.body[0].id))
           .then(r => cloud.get(`${test.api}/${Did}`));
  });

  test.should.supportNextPagePagination(2,false);
  test.withOptions({ qs: { where: `WHENMODIFIED ='08/13/2016 05:26:37'` } })
  .withName('should support Ceql WHENMODIFIED search')
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.WHENMODIFIED = '08/13/2016 05:26:37');
    expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
});
