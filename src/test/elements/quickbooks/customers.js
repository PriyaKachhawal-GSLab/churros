'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const cloud = require('core/cloud');

suite.forElement('finance', 'customers', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "familyName": tools.random(),
        "givenName": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.should.supportCeqlSearch('familyName');
  it('should support CEQL style boolean queries with single quotes', () => {
    return cloud.withOptions({ qs: { where: "active='true'" }}).get('/customers');
  });
  it('should support native style boolean queries without single quotes', () => {
    return cloud.withOptions({ qs: { where: "active=true" }}).get('/customers');
  });
});
