'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const inventoryTransfersCreatePayload = tools.requirePayload(`${__dirname}/assets/inventory-transfers-create.json`);
const inventoryTransfersUpdatePayload = tools.requirePayload(`${__dirname}/assets/inventory-transfers-update.json`);

const options = {
  churros: {
    updatePayload: inventoryTransfersUpdatePayload
  }
};

suite.forElement('erp', 'inventory-transfers', { payload : inventoryTransfersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});