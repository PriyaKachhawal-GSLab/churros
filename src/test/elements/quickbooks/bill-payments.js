'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const billPaymentsCreatePayload = tools.requirePayload(`${__dirname}/assets/bill-payments-create.json`);
const billPaymentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/bill-payments-update.json`);

const options = {
  churros: {
    updatePayload: billPaymentsUpdatePayload
  }
};

suite.forElement('finance', 'bill-payments', { payload: billPaymentsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('totalAmt');
});