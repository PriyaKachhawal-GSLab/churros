'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
suite.forElement('finance', 'tax-rates', (test) => {
  test.should.supportPagination();
  test.should.supportSr();
    test.withApi(test.api)
    .withOptions({ qs: { where: `taxDetailKeyId='AUSSTE+PS0N0'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.taxDetailKey.id !== "")).to.not.be.empty)
    .withName('should allow GET with option taxDetailKeyId')
    .should.return200OnGet();
    
  });
