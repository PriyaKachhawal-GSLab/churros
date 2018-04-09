'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const phoneCallsPayload = require('./assets/phone-calls');

suite.forElement('erp', 'phone-calls', { payload: phoneCallsPayload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  
  test
    .withName(`should support searching ${test.api} by title`)
    .withOptions({ qs: { where: "title = 'PC10'" } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.title === 'PC10');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
