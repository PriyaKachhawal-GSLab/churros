'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = require('./assets/vendor-credits');

suite.forElement('finance', 'vendor-credits', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Id and returnCount in response`)
    .withOptions({ qs: { where: `id ='1234'`, returnCount: true } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();

});
