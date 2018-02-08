'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/vendor-invoice.json`);

suite.forElement('finance', 'vendor-invoices', { payload: payload }, (test) => {
  test.should.supportCruds();
  test
    .withOptions({ qs: { where: 'suppliernumber = \'2\'' } })
    .withName('should support search by SupplierNumber')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.SupplierNumber = '2');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});
