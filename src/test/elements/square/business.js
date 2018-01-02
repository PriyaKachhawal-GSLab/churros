'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('employee', 'business', (test) => {
  // This resource returns a single object response
  test.withValidation(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.id).to.not.be.empty;
  }).should.return200OnGet();
});
