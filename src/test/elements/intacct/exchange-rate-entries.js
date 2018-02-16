'use strict';

const suite = require('core/suite');

suite.forElement('payment', 'exchange-rate-entries', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(2);
});
