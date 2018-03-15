'use strict';

const suite = require('core/suite');

suite.forElement('payment', 'balances', (test) => {
  test.should.return200OnGet();
});
