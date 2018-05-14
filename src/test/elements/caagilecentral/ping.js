'use strict';

const suite = require('core/suite');

suite.forElement('general', 'ping', null, (test) => {
  test.should.return200OnGet();
});
