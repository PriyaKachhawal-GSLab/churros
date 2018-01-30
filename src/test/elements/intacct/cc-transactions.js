'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'cc-transactions', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(2, false);
  test
    .withOptions({ qs: { where: `RECORDNO = 2360` } })
    .withName('should support Ceql RECORDNO search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.RECORDNO = 2360);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
