'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const lotNumberedInventoryItemsCreatePayload = tools.requirePayload(`${__dirname}/assets/lot-numbered-inventory-items-create.json`);
const lotNumberedInventoryItemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/lot-numbered-inventory-items-update.json`);

const options = {
  churros: {
    updatePayload: lotNumberedInventoryItemsUpdatePayload
  }
};

suite.forElement('erp', 'lot-numbered-inventory-items', { payload : lotNumberedInventoryItemsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});