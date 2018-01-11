'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const customerPayload = tools.requirePayload(`${__dirname}/assets/customer.json`);

suite.forElement('employee', 'customers', { payload : customerPayload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
});
