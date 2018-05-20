'use strict';

const suite = require('core/suite');

suite.forElement('general', 'branches', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});
