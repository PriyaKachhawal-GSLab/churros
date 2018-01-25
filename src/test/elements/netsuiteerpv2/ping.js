'use strict';

const suite = require('core/suite');

suite.forElement('erp', 'ping', null, (test) => {
  test.should.return200OnGet();
});
