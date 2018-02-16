'use strict';

const suite = require('core/suite');
const payload = require('./assets/billing-accounts');

suite.forElement('erp', 'billing-accounts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.should.supportCeqlSearch('id');
});
