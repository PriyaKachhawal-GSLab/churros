'use strict';

const suite = require('core/suite');
const payload = require('./assets/leads');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('marketing', 'leads', { payload: payload }, (test) => {
  test.should.supportCrud();
  test
    .withOptions({ qs: { where: 'OpportunityTitle=\'Final\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.State = 'OpportunityTitle');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
