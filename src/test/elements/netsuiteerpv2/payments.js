'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const paymentsCreatePayload = tools.requirePayload(`${__dirname}/assets/payments-create.json`);
const paymentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/payments-update.json`);

const options = {
  churros: {
    updatePayload: paymentsUpdatePayload
  }
};

suite.forElement('erp', 'payments', { payload : paymentsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});