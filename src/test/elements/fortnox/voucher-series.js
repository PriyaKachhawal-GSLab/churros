'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'voucher-series', (test) => {
  test.withApi(`${test.api}`)
    .withName('should allow GET voucher series')
    .should.return200OnGet();

  test.should.supportPagination();
});