'use strict';

const suite = require('core/suite');
const payload =  require('core/tools').requirePayload(`${__dirname}/assets/non-inventory-resale-items.json`);

suite.forElement('erp', 'non-inventory-resale-items', { payload: payload }, (test) => {
  	test.should.supportCruds();
	test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  	test.should.supportCeqlSearch('id');
});
