'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

suite.forElement('erp', 'voucher-series', (test) => {
  test.withApi(`${test.api}`)
    .withName('should allow GET voucher series')
    .should.return200OnGet();

  test.should.supportPagination();
});