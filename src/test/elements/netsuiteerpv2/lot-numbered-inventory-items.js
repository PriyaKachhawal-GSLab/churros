'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/lot-numbered-inventory-items.json`);

payload.itemId = tools.random();

suite.forElement('erp', 'lot-numbered-inventory-items', { payload: payload }, (test) => {
  	test.should.supportCruds();
	test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  	test.should.supportCeqlSearch('id');
});
