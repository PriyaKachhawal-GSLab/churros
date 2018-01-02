'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'users', (test) => {
  test.withApi(`${test.api}/1`).should.return200OnGet();
});
