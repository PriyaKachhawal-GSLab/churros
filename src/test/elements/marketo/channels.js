'use strict';

const suite = require('core/suite');

suite.forElement('marketing', 'channels', (test) => {
  test.should.supportSr();
});
