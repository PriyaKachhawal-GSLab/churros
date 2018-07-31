'use strict';

const suite = require('core/suite');

suite.forElement('rewards', 'me', null, (test) => {
  test.should.return200OnGet();
});
