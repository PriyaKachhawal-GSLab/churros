'use strict';

const suite = require('core/suite');

suite.forElement('general', 'users', (test) => {
  test.should.return200OnGet();
  test.should.supportPagination('id');
});
