'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'ledger-accounts', (test) => {
  test.should.supportPagination();
  test.should.supportSr();
  test.withApi(test.api)
  .withOptions({ qs: { where: `alias= '$OA'` } })
  .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
  .withName('should allow GET with option alias name')
  .should.return200OnGet();  
   
  });
