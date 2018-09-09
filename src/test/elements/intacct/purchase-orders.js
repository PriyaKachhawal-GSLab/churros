'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const vendorsCreatePayload = tools.requirePayload(`${__dirname}/assets/vendors-create.json`);
const journalsCreatePayload = tools.requirePayload(`${__dirname}/assets/journals-create.json`);
const transactionsCreatePayload = tools.requirePayload(`${__dirname}/assets/transactions-create.json`);
const purchaseOrdersCreatePayload = tools.requirePayload(`${__dirname}/assets/purchase-orders-create.json`);
const purchaseOrdersUpdatePayload = tools.requirePayload(`${__dirname}/assets/purchase-orders-update.json`);

const options = {
  churros: {
    updatePayload: purchaseOrdersUpdatePayload
  }
};


suite.forElement('finance', 'purchase-orders', { payload: purchaseOrdersCreatePayload }, (test) => {
  let vendorId, journalId, transactionId;

  before(() => cloud.post(`hubs/finance/vendors`, vendorsCreatePayload)
  .then(r => {
    vendorId = r.body.id;
    purchaseOrdersCreatePayload.vendorid = vendorId;
    purchaseOrdersUpdatePayload.vendorid = vendorId;
    })
    .then(() => cloud.post(`hubs/finance/journals`, journalsCreatePayload))
    .then(r => {
      journalId = r.body.id;
      transactionsCreatePayload.journalid = journalId;
    })
    .then(() => cloud.post(`hubs/finance/transactions`, transactionsCreatePayload))
    .then(r => {
      transactionId = r.body.id;
      purchaseOrdersCreatePayload.transactionid = transactionId;
      purchaseOrdersUpdatePayload.transactionid = transactionId;
    })
  );

  after(() => cloud.delete(`hubs/finance/transactions/${transactionId}`)
 .then(() => cloud.delete(`hubs/finance/journals/${journalId}`)
 .then(() => cloud.delete(`hubs/finance/vendors/${vendorId}`))));

  test.should.supportPagination('id');
  test.withOptions(options).should.supportCrds();
  test.should.supportCeqlSearchForMultipleRecords('vendorid');
});