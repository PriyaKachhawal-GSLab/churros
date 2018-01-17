'use strict';

const suite = require('core/suite');

suite.forElement('helpdesk', 'ping', null, (test) => {
  test.should.return200OnGet();
});
