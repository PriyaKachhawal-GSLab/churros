'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/vendors.json`);
payload.supplierNumber = tools.randomInt();

suite.forElement('erp', 'vendors', { payload: payload }, (test) => {
  test.should.supportCrs();
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `name = 'madhuri' ` } })
    .withName('should support Ceql name search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.name = 'madhuri');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
