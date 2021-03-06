'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;

const payload = tools.requirePayload(`${__dirname}/assets/paymentTerms.json`);

suite.forElement('erp', 'payment-terms', { payload: payload }, (test) => {
  test.should.supportCruds(chakram.put);
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `name = 'madhuri' ` } })
    .withName('should support Ceql name search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.name = 'madhuri');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

});
