'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'institutions', (test) => {
  test.withName(`should support searching ${test.api} by products`)
    .withOptions({ qs: { where: `products = 'auth'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.products.includes('auth'));
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportSr();
  test.should.supportPagination();
});
