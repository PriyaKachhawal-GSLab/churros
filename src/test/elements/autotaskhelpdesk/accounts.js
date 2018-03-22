'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/accounts');
const expect = require('chakram').expect;

suite.forElement('helpdesk', 'accounts', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { where: 'accountName=\'churrosTestAccount\'' } })
      .withValidation((r) => {
        expect(r).to.have.statusCode(200);
        const validValues = r.body.filter(obj => obj.accountName = 'churrosTestAccount');
        expect(validValues.length).to.equal(r.body.length);
      }).should.return200OnGet();
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
 });
