'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'custom-fields', (test) => {
  test.should.return200OnGet();
  test.should.supportNextPagePagination(3,false);
});
