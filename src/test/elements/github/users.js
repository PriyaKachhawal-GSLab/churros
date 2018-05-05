'use strict';

const suite = require('core/suite');

suite.forElement('general', 'users', (test) => {
  test.should.supportS();
  test.should.supportPagination();
});
