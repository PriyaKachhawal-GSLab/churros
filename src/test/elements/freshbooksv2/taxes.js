'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/tax.json`);

suite.forElement('finance', 'taxes', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "updated_min='2018-02-01'" } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.updated >= "2018-02-01");
      expect(validValues.length).to.equal(r.body.length);
    })
    .withName('should allow GET with option updated_min')
    .should.return200OnGet();
});
