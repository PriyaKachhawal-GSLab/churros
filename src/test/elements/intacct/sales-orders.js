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

suite.forElement('finance', 'sales-orders', { payload: salesOrdersCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('documentnumber');
});
