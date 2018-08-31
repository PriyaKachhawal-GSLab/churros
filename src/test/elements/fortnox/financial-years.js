'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('erp', 'financial-years', (test) => {
  test.withApi(`${test.api}`)
    .withName('should allow GET financial years')
    .should.return200OnGet();
  test.withApi(`${test.api}`)
    .withOptions({ qs: { where: 'date = \'2014-01-01\'' } })
    .withName('should allow GET financial years by date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.Id = 3);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});