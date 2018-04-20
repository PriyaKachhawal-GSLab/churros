'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'account/profile', (test) => {
  test.should.supportS();
});
