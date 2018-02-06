'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'chargecard-transactions', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(2, false);
  test
    .withOptions({ qs: { where: `WHENMODIFIED > '01/22/2018 08:03:44'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = '01/22/2018 08:03:44');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
