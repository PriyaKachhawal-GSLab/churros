'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const nonInventoryResaleItemsCreatePayload = tools.requirePayload(`${__dirname}/assets/non-inventory-resale-items-create.json`);
const nonInventoryResaleItemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/non-inventory-resale-items-update.json`);

const options = {
  churros: {
    updatePayload: nonInventoryResaleItemsUpdatePayload
  }
};

suite.forElement('erp', 'non-inventory-resale-items', { payload : nonInventoryResaleItemsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});