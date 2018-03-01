'use strict';

const suite = require('core/suite');
const payload = require('./assets/purchases');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;

payload.docNumber = tools.random();

suite.forElement('finance', 'purchases', { payload: payload }, (test) => {
  test.should.supportCruds();
  test
  	.withOptions({ qs: { page: 1, pageSize: 5, returnCount: true } })
  	.withName(`Test for returnCount in headers`)
  	.withValidation((r) => {
      expect(r).to.have.statusCode(200);
      expect(r.response.headers['elements-total-count']).to.exist;
  }).should.return200OnGet();
  test.should.supportCeqlSearch('docNumber');
});
