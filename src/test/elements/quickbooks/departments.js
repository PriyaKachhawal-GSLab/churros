'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/departments.json`);
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'departments', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "name": tools.random(),
        "fullyQualifiedName": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5, returnCount: true } })
  .withName('Test for returnCount in response')
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();
  test.should.supportCeqlSearch('name');
});
