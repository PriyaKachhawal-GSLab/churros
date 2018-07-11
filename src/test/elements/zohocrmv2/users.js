'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('crm', 'users', null, (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by type`)
    .withOptions({ qs: { type: 'CurrentUser' } })
    .withValidation(r => {
      expect(r.body.length).to.equal(1);
    })
    .should.return200OnGet();
});
