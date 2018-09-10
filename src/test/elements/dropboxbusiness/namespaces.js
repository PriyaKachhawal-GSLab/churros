'use strict';

const suite = require('core/suite');
const props = require('core/props');

suite.forElement('documents', 'namespaces', (test) => {
  test.should.supportS();
  test.should.supportPagination();
});
