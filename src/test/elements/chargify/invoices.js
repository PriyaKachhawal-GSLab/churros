'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

suite.forElement('payment', 'invoices', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});
