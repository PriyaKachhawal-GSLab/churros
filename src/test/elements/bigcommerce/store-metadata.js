'use strict';
const suite = require('core/suite');

suite.forElement('ecommerce', 'store-metadata', null, (test) => {
  test.should.return200OnGet();
});
