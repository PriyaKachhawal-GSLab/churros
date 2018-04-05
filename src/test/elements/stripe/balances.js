'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');

suite.forElement('payment', 'balances', (test) => {
  test.withValidation((r) => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.be.an('Array');
    })
    .should.return200OnGet();
});