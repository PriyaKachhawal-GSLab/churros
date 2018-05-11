'use strict';

const suite = require('core/suite');
const payload = require('./assets/contacts');

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  test.should.supportCrud();
  test.withOptions({qs: { where: 'Email=\'senior.churros@cloud-elements.com\''}}).should.return200OnGet();
});
