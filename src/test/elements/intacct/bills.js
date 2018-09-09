'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const vendorsCreatePayload = tools.requirePayload(`${__dirname}/assets/vendors-create.json`);
const billsCreatePayload = tools.requirePayload(`${__dirname}/assets/bills-create.json`);
const billsUpdatePayload = tools.requirePayload(`${__dirname}/assets/bills-update.json`);

const billsOptions = {
  churros: {
    updatePayload: billsUpdatePayload
  }
};

suite.forElement('finance', 'bills', { payload: billsCreatePayload }, (test) => {
  let vendorId;
  
  before(() => cloud.post(`/hubs/finance/vendors`, vendorsCreatePayload)
    .then(r => {
      vendorId = r.body.id;
      billsCreatePayload.vendorid = vendorId;
      billsUpdatePayload.vendorid = vendorId;
      billsUpdatePayload.billno = billsCreatePayload.billno;
    }));

  after(() => cloud.delete(`/hubs/finance/vendors/${vendorId}`));

  test.withOptions(billsOptions).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('vendorid');
});
