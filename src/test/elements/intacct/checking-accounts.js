'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'checking-accounts', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1,false);
  test
     .withOptions({ qs: { where: `BANKACCOUNTTYPE >= 'checking'` } })
     .withName('should support Ceql BANKACCOUNTTYPE search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.BANKACCOUNTTYPE == 'checking');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();});
