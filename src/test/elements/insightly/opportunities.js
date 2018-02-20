'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = tools.requirePayload(`${__dirname}/assets/opportunities.json`);

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "OPPORTUNITY_STATE": "Lost"
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Opportunity State`)
    .withOptions({ qs: { where: `OPPORTUNITY_STATE ='won'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.OPPORTUNITY_STATE = 'won');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

});
