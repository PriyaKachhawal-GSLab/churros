'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('crm', 'users', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by DATE_UPDATED_UTC`)
    .withOptions({ qs: { where: `updated_after_utc ='2018-02-21 07:31:45'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.DATE_UPDATED_UTC = '2018-02-21 07:31:45');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});