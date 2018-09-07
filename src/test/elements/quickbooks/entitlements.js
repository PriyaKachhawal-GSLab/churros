'use strict';

const suite = require('core/suite');

suite.forElement('finance', 'entitlements', null, (test) => {
  test.should.return200OnGet();
});
