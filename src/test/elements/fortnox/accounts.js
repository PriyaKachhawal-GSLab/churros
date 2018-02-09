'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

let payload = tools.requirePayload(`${__dirname}/assets/account.json`);
payload.Number = Math.floor(1000 + Math.random() * 9000);

suite.forElement('erp', 'accounts', { payload: payload }, (test) => {
  test.should.supportCrus();
  test
    .withOptions({ qs: { where: 'sru = 7201' } })
    .withName('should support search by SRU')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.SRU = 7201);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});
