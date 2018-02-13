'use strict';

const suite = require('core/suite');
const payload = require('./assets/credit-memos');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'credit-memos', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1, returnCount: true } })
    .withName('Test for search on totalAmt and returnCount in response')
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.totalAmt = '1');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();
});
