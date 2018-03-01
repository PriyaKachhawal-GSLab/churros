'use strict';

const suite = require('core/suite');
const payload = require('./assets/bill-payments');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'bill-payments', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1, returnCount: true } })
  	.withName('Test for search on totalAmt and returnCount in response')
  	.withValidation(r => {
      expect(r).to.statusCode(200);
      expect(r.response.headers['elements-total-count']).to.exist;
    })
  .should.return200OnGet();
});
