'use strict';

const suite = require('core/suite');

suite.forElement('general', 'me', (test) => {
  test.should.supportS();
});
