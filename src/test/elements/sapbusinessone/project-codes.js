'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'project-codes', { }, (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});
