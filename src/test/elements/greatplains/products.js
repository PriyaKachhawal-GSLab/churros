'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
suite.forElement('finance', 'products', (test) => {
  test.should.supportPagination();
  test.should.supportSr();
    test.withApi(test.api)
    .withOptions({ qs: { where: `lastModifiedDate>='2014-01-15T00:00:00.000Z'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option lastModifiedDate')
    .should.return200OnGet();
    
  });
