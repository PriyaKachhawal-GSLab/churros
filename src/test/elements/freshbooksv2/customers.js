'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/customer.json`);

suite.forElement('finance', 'customers', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "updated_min='2018-02-01'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .withName('should allow GET with option updated_min')
    .should.return200OnGet();
});
