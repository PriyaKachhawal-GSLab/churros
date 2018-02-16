'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/invoice.json`);

before(() => cloud.get('/customers')
  .then(r => {
    expect(r.body).to.not.be.empty;
    payload.customerid = r.body[0].id;
    payload.create_date = new Date().toISOString().substring(0, 10);
  }));
suite.forElement('finance', 'invoices', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "currency_code='USD'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.currency_code === "USD")).to.not.be.empty)
    .withName('should allow GET with option currency_code')
    .should.return200OnGet();
});