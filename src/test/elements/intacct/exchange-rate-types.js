'use strict';

const suite = require('core/suite');

suite.forElement('payment', 'exchange-rate-types', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(2)
});
