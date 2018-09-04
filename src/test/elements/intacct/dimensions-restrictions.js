'use strict';

const suite = require('core/suite');

// Skipping this test data for dimensions-restrictions cannot be generated
suite.forElement('finance', 'dimensions-restrictions', { skip: true }, (test) => {
  test.should.return200OnGet();
  test.should.supportNextPagePagination(1);
});
