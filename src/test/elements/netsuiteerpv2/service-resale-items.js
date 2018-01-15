'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('./assets/service-resale-items');

payload.itemId += tools.random();

suite.forElement('erp', 'service-resale-items', { payload: payload }, (test) => {
  	test.should.supportCruds();
	test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  	test.should.supportCeqlSearch('id');
});
