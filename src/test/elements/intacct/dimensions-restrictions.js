'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'dimensions-restrictions', (test) => {
  test.should.return200OnGet();
  test.should.supportNextPagePagination(1);
});
