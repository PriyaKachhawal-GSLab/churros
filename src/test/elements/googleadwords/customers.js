'use strict';

const suite = require('core/suite');

suite.forElement('general', 'customers', (test) => { 
  test.should.supportSr();
  test.should.supportPagination();
});
