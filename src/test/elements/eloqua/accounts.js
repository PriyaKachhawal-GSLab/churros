'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('marketing', 'accounts', { payload: payload }, (test) => {
  const opts = {
    churros: {
      updatePayload: {
        name: 'Robot Test Update'
      }
    }
  };
  test.withOptions(opts).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Country`)
    .withOptions({ qs: { where: `country='India'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.country = 'India');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});