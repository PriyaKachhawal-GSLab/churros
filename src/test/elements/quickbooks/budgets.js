'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'budgets', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test.should.supportCeqlSearch('active');
});
