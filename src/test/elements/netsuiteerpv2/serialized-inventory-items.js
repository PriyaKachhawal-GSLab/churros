'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const serializedInventoryItemsCreatePayload = tools.requirePayload(`${__dirname}/assets/serialized-inventory-items-create.json`);
const serializedInventoryItemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/serialized-inventory-items-update.json`);

const options = {
  churros: {
    updatePayload: serializedInventoryItemsUpdatePayload
  }
};

suite.forElement('erp', 'serialized-inventory-items', { payload : serializedInventoryItemsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});