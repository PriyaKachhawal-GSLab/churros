'use strict';

const suite = require('core/suite');

suite.forElement('social', 'ping', null, (test) => {
  test.should.return200OnGet();
});
