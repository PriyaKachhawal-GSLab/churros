'use strict';

const suite = require('core/suite');

suite.forElement('humancapital', 'industries', { }, (test) => {
  test.should.supportS();
  test.should.supportPagination(1);
});
