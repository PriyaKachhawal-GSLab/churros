'use strict';

const suite = require('core/suite');
const payload = require('./assets/refund-receipts');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'refund-receipts', { payload: payload}, (test) => {
  test.withOptions({skip:true}).should.supportCruds();
  test.should.supportSr();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Id and returnCount in response`)
    .withOptions({ qs: { where: `id ='1234'`, returnCount: true } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();

});
