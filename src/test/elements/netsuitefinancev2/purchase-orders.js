'use strict';

const suite = require('core/suite');
const payload = require('./assets/purchase-orders');

suite.forElement('finance', 'purchase-orders', { payload: payload }, (test) => {
  	test.should.supportCruds();
	test.withOptions({ qs: { page: 1, pageSize: 5}}).should.supportPagination();
  	test.should.supportCeqlSearch('id');
    test.withOptions({ qs: { where: "status='_purchaseOrderPendingBill'",page: 1, pageSize: 5 } }).should.return200OnGet();
});
