'use strict';

const suite = require('core/suite');
const payload = require('./assets/vendor-credits');

suite.forElement('finance', 'vendor-credits', { payload: payload }, (test) => {
  	test.should.supportCruds();
	  test.withOptions({ qs: { page: 1, pageSize: 5}}).should.supportPagination('id');
  	test.should.supportCeqlSearch('id');
});
