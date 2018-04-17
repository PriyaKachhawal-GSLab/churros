'use strict';

const suite = require('core/suite');

suite.forElement('documents', 'me', (test) => {
  test.should.supportS();
});
