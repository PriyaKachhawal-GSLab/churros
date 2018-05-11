'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');

suite.forElement('marketing', 'accounts', { payload: payload }, (test) => {
  test.should.supportCrud();
  test.withOptions({qs: { where: 'FirstName=\'Churros\''}}).should.return200OnGet();
});
