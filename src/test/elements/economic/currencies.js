'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('erp', 'currencies', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `code = 'ADE' ` } })
    .withName('should support Ceql code search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.code = 'ADE');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
