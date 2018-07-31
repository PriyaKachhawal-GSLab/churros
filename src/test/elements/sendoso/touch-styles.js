'use strict';

const suite = require('core/suite');

suite.forElement('rewards', 'touch-styles', null, (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});
