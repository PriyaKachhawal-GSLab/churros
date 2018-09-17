'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/task.json`);

suite.forElement('finance', 'tasks', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "rate_min=0" } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.rate.amount >= 0);
      expect(validValues.length).to.equal(r.body.length);
    })
    .withName('should allow GET with option rate_min')
    .should.return200OnGet();
});
