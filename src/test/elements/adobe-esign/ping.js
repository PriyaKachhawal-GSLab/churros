'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('esignature', 'ping', null, (test) => {
  test.withApi(test.api)
    .withName(`should allow GET /ping for system health`)
    .withValidation(r => expect(r.body.endpoint).to.equal('adobe-esign'))
    .should.return200OnGet();
});
