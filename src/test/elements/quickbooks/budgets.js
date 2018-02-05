'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

suite.forElement('finance', 'budgets', (test) => {
  test.should.supportSr();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
});
