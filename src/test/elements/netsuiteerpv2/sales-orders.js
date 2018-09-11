'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const salesOrdersCreatePayload = tools.requirePayload(`${__dirname}/assets/sales-orders-create.json`);
const salesOrdersUpdatePayload = tools.requirePayload(`${__dirname}/assets/sales-orders-update.json`);

const options = {
  churros: {
    updatePayload: salesOrdersUpdatePayload
  }
};

suite.forElement('erp', 'sales-orders', { payload : salesOrdersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});