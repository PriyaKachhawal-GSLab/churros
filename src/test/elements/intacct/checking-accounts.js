'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'checking-accounts', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(2, false);
  test
    .withOptions({ qs: { where: `WHENMODIFIED ='08/13/2016 05:26:37'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = '08/13/2016 05:26:37');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
