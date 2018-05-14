'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('marketing', 'accounts', { payload: payload }, (test) => {
  test.should.supportCrud();
  test
    .withOptions({ qs: { where: 'FirstName=\'Churros\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.State = 'FirstName');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
