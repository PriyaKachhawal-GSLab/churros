'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const updatePayload = tools.requirePayload(`${__dirname}/assets/expenses-update.json`);
const payload = tools.requirePayload(`${__dirname}/assets/expenses-create.json`);

suite.forElement('finance', 'expenses', { payload: payload }, (test) => {
  test.withOptions({ churros: { updatePayload: updatePayload } }).should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'categoryid =\'3729837\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.categoryid = '3729837');
      expect(validValues.length).to.equal(r.body.length);
    });
  test.withApi(test.api)
    .withOptions({ qs: { where: "amount_min=9000" } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.amount.amount >= 9000);
      expect(validValues.length).to.equal(r.body.length);
    })
    .withName('should allow GET with option amount_min')
    .should.return200OnGet();
});
