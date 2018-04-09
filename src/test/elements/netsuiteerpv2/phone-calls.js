'use strict';

const suite = require('core/suite');
const phoneCallsPayload = require('./assets/phone-calls');

suite.forElement('erp', 'phone-calls', { payload: phoneCallsPayload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.should.supportCeqlSearch('title');
});
