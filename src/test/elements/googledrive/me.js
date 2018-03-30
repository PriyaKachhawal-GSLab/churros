'use strict';

const suite = require('core/suite');

suite.forElement('documents', 'me',null, (test) => {
   test.should.return200OnGet();
});
