'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'products', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});