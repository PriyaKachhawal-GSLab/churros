'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('./assets/serialized-inventory-items');

payload.itemId += tools.random();

suite.forElement('erp', 'serialized-inventory-items', { payload: payload }, (test) => {
  	test.should.supportCruds();
	  test.withOptions({ qs: { page: 1, pageSize: 5}}).should.return200OnGet();
  	test.should.supportCeqlSearch('id');
});
