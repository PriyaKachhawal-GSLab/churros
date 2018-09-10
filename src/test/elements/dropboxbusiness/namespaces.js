'use strict';

const suite = require('core/suite');

suite.forElement('documents', 'namespaces', (test) => {
  test.should.supportS();
  test.should.supportPagination();
});
