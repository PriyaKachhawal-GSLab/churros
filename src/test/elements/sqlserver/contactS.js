'use strict';

const suite = require('core/suite');
const payload = require('./assets/contactS');

suite.forElement('db', 'contactS', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportCeqlSearch('id');
  test.should.supportPagination();
});
