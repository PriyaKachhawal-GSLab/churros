'use strict';

const suite = require('core/suite');

suite.forElement('scheduling', 'calendars', (test) => {
  test.should.return200OnGet();
  test.should.supportPagination();
});
