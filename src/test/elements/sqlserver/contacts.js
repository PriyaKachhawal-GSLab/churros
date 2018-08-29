'use strict';

const suite = require('core/suite');
const payload = require('./assets/contacts');

suite.forElement('db', 'contacts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportCeqlSearch('id');
  test.should.supportPagination();
});
