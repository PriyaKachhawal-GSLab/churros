'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const expect = require('chakram').expect;

//As delete customers is not supported skipped test cases.
suite.forElement('finance', 'customers', { payload: payload }, (test) => {
  test.withOptions({skip:true}).should.supportCrus();
  test.withName(`should support searching ${test.api} by accountName`).
  withOptions({ qs: { where: 'accountName=\'churrosTestCustomer\'' } }).
  withValidation((r) =>
  { expect(r).to.have.statusCode(200);
    const validValues = r.body.filter(obj => obj.accountName ='churrosTestCustomer'); expect(validValues.length)
  .to.equal(r.body.length); }).
  should.return200OnGet();
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
});
