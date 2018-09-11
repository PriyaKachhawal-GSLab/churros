'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const vendorPaymentsCreatePayload = tools.requirePayload(`${__dirname}/assets/vendor-payments-create.json`);
const vendorPaymentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/vendor-payments-update.json`);

const options = {
  churros: {
    updatePayload: vendorPaymentsUpdatePayload
  }
};

suite.forElement('erp', 'vendor-payments', { payload : vendorPaymentsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});