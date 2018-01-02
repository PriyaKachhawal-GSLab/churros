'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'credit-terms', (test) => {
  test.should.supportSr();
  test
    .withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name='1% 10 Net 30'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name === `1% 10 Net 30`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportNextPagePagination(1);
});
