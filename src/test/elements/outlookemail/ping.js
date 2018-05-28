'use strict';

const suite = require('core/suite');

suite.forElement('general', 'ping', (test) => {
   test.should.return200OnGet();
});
