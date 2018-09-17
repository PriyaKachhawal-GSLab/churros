'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/item.json`);

suite.forElement('finance', 'items', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "unit_cost_min=4" } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.unit_cost.amount >= 4);
      expect(validValues.length).to.equal(r.body.length);
    })
    .withName('should allow GET with option unit_cost_max')
    .should.return200OnGet();
});
