'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'payment-types', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
});
