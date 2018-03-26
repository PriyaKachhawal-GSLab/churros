'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'vendor-groups', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
});
