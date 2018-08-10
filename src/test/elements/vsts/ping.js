'use strict';

const suite = require('core/suite');

suite.forElement('collaboration', 'ping', (test) => {
  test.should.return200OnGet();
});
