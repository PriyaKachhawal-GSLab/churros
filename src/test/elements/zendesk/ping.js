'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'ping', (test) => {
  test.withApi(test.api)
    .withName(`should allow GET /ping for system health`)
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.endpoint).to.equal('zendesk');
      expect(r.body.valid).to.equal(true);
    })
    .should.return200OnGet();
});
