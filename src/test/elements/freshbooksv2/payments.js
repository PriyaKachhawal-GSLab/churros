'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/payment.json`);

before(() => cloud.get('/invoices')
  .then(r => {
    expect(r.body).to.not.be.empty;
    payload.invoiceid = r.body[0].id;
    payload.date = new Date().toISOString().substring(0, 10);
  }));
suite.forElement('finance', 'payments', { payload: payload }, (test) => {

  test.should.supportCruds();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "updated_min='2018-02-01'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated >= "2018-02-01")).to.not.be.empty)
    .withName('should allow GET with option updated_min')
    .should.return200OnGet();
});