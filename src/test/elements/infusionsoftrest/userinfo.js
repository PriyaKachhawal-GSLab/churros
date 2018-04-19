'use strict';

const suite = require('core/suite');

suite.forElement('crm', 'oauth/connect/userinfo', (test) => {
  test.should.supportS();
});