'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/recurring-order-entry-transactions-create.json`);
const customerPayload = tools.requirePayload(`${__dirname}/assets/customers.json`);

suite.forElement('finance', 'recurring-order-entry-transactions', { payload: payload }, (test) => {
  let customerId;
  before(() => cloud.post('/hubs/finance/customers', customerPayload)
    .then(r => customerId = r.body.id)
    .then(r => payload.customerid = customerId));

  test.should.supportCrds();
  test.should.supportNextPagePagination(2);
  it('should CEQL search with RECORDNO', () => {
    let recordNo;
    return cloud.get(test.api)
      .then(r => recordNo = r.body[0].RECORDNO)
      .then(r => cloud.withOptions({ qs: { where: `RECORDNO=${recordNo}` } }).get(test.api))
      .then(r => {
        expect(r).to.statusCode(200);
        expect(r.body.length).to.be.equal(1);
      });
  });
  after(() => cloud.delete(`/hubs/finance/customers/${customerId}`));
});
