'use strict';

const suite = require('core/suite');

suite.forElement('scheduling', 'ping', (test) => {
   test.should.return200OnGet();
});
