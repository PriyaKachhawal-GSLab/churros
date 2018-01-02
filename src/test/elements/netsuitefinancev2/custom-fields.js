'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'custom-fields', (test) => {
  test.should.return200OnGet();
  test.should.supportNextPagePagination(3,false);
});
suite.forElement('finance', 'custom/fields', (test) => {
  test.should.return200OnGet();
});
