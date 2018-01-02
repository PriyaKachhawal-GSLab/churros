'use strict';

const suite = require('core/suite');

suite.forElement('esignature', 'uris', (test) => {
  test.should.return200OnGet();
});
