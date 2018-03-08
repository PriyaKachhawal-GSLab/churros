'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'activities', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});