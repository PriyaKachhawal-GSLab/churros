'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('./assets/customers');

suite.forElement('crm', 'customers', { payload: payload }, (test) => {
  payload.firstName = tools.random();
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.should.supportCeqlSearch('id');
});