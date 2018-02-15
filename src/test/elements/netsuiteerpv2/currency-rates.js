'use strict';

const suite = require('core/suite');
const payload = require('./assets/currency-rates');

suite.forElement('erp', 'currency-rates', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.should.supportCeqlSearch('id');
});
