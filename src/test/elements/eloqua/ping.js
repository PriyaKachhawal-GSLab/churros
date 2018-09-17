'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'ping', null, (test) => {
  test.should.return200OnGet();
});