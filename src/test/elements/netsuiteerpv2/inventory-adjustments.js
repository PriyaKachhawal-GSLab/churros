'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const inventoryAdjustmentsCreatePayload = tools.requirePayload(`${__dirname}/assets/inventory-adjustments-create.json`);
const inventoryAdjustmentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/inventory-adjustments-update.json`);

const options = {
  churros: {
    updatePayload: inventoryAdjustmentsUpdatePayload
  }
};

suite.forElement('erp', 'inventory-adjustments', { payload : inventoryAdjustmentsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});