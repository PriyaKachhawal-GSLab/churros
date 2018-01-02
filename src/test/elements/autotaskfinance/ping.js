'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'ping', (test) => {
  test.should.return200OnGet();
});
