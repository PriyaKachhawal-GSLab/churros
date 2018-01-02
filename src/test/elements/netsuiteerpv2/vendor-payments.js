'use strict';

const suite = require('core/suite');
const payload = require('./assets/vendor-payments');

suite.forElement('erp', 'vendor-payments', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});
