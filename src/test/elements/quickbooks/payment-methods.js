'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = tools.requirePayload(`${__dirname}/assets/payment-methods.json`);

suite.forElement('finance', 'payment-methods', { payload: payload }, (test) => {
  test.should.supportCrs();
  test.withOptions({ qs: { page: 1, pageSize: 1 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Id`)
    .withOptions({ qs: { where: `id ='1234'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();


});
