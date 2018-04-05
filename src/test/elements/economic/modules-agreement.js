'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('erp', 'modules-agreement', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `name = 'API' ` } })
    .withName('should support Ceql name search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.name = 'API');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
