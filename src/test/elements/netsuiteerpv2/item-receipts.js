'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const itemReceiptsCreatePayload = tools.requirePayload(`${__dirname}/assets/item-receipts-create.json`);
const itemReceiptsUpdatePayload = tools.requirePayload(`${__dirname}/assets/item-receipts-update.json`);
const purchaseOrdersCreatePayload = tools.requirePayload(`${__dirname}/assets/purchase-orders-create.json`);


const options = {
  churros: {
    updatePayload: itemReceiptsUpdatePayload
  }
};

suite.forElement('erp', 'item-receipts', { payload: itemReceiptsCreatePayload }, (test) => {
  let purchaseOrderId;

  before(() => cloud.post(`/hubs/erp/purchase-orders`, purchaseOrdersCreatePayload)
    .then(r => {
      purchaseOrderId = r.body.id;
    })
  );

  after(() => cloud.delete(`/hubs/erp/purchase-orders/${purchaseOrderId}`));

  it(`should allow CRUDS for ${test.api}`, () => {
    itemReceiptsCreatePayload.createdFrom.internalId = purchaseOrderId;
    itemReceiptsUpdatePayload.createdFrom.internalId = purchaseOrderId;
    return cloud.withOptions(options).cruds(`${test.api}`, itemReceiptsCreatePayload);
  });

});