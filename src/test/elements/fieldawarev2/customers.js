'use strict';

const suite = require('core/suite');
const payload = require('./assets/customers');
const tools = require('core/tools');

suite.forElement('fsa', 'customers', { payload: payload }, (test) => {
  payload.name = tools.random();
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.should.supportCeqlSearch('name');
});
