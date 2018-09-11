'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const purchaseOrdersCreatePayload = tools.requirePayload(`${__dirname}/assets/purchase-orders-create.json`);
const purchaseOrdersUpdatePayload = tools.requirePayload(`${__dirname}/assets/purchase-orders-update.json`);

const options = {
  churros: {
    updatePayload: purchaseOrdersUpdatePayload
  }
};

suite.forElement('erp', 'purchase-orders', { payload: purchaseOrdersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});