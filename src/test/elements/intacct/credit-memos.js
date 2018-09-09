'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const creditMemosCreatePayload = tools.requirePayload(`${__dirname}/assets/credit-memos-create.json`);

suite.forElement('finance', 'credit-memos', { payload: creditMemosCreatePayload }, (test) => {
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
