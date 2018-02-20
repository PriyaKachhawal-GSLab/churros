'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = tools.requirePayload(`${__dirname}/assets/leads.json`);

suite.forElement('crm', 'leads', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "last_name": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Last Name`)
    .withOptions({ qs: { where: `last_name ='MAC'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.LAST_NAME = 'MAC');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

});
