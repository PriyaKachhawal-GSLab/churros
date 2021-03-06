'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/customer.json`);

suite.forElement('erp', 'customers', { payload: payload }, (test) => {
  test
    .withOptions({ qs: { where: 'customernumber = \'10\'' } })
    .withName('should support search by CustomerNumber')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '10');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
  test.should.supportCruds();
});
