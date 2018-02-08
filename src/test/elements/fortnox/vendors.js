'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/vendor.json`);

suite.forElement('finance', 'vendors', { payload: payload }, (test) => {
  test.should.supportCrus();
  test
    .withOptions({ qs: { where: 'suppliernumber = \'10\'' } })
    .withName('should support search by SupplierNumber')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.SupplierNumber = '10');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});
