'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'owners', (test) => {
  test.should.supportS();

  test.should.supportPagination();
});
