'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'bank-account-types', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  //where clause donot work
});
