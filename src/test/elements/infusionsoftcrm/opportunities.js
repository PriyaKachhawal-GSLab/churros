'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = require('./assets/opportunities');

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  test.should.supportCrud();
  //test.withOptions({qs: { where: 'OpportunityTitle=\'Robot Test\''}}).should.return200OnGet();
  test.withOptions({ qs: { where: 'OpportunityTitle=\'Robot Test\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.OpportunityTitle = 'Robot Test');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
