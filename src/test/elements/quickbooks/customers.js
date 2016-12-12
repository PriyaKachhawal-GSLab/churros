'use strict';

const suite = require('core/suite');
const payload = require('./assets/customers');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const customers = build({ familyName: tools.random(), givenName: tools.random()});

suite.forElement('finance', 'customers', { payload: customers, skip: false}, (test) => {
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
});
