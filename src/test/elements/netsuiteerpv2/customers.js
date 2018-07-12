'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);

suite.forElement('erp', 'customers', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  //test.should.supportCeqlSearch('id');
  test.withOptions({ qs: { page: 1,
                           pageSize: 5,
                           where : "savedSearchId = '18'"
                         } }).should.return200OnGet();
});
