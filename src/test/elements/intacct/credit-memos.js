'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/creditMemos.json`);

suite.forElement('finance', 'credit-memos', { payload: payload }, (test) => {
  test.should.supportCrs();
  test.should.supportPagination();
  test.withName('should support customerid=AGR001 Ceql search')
  .withOptions({ qs: { where: 'customerid= \'AGR001\'' } })
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.customerid = 'AGR001');
    expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
});
