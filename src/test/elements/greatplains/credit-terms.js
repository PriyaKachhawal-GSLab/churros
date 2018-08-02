'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;
suite.forElement('finance', 'credit-terms', (test) => {
  test.should.supportPagination();
  test.should.supportSr();
  test.withApi(test.api)
    .withOptions({ qs: { where: `id='2% 10/Net 30'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option id')
    .should.return200OnGet();  
  });
