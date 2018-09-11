'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const customerRefundsCreatePayload = tools.requirePayload(`${__dirname}/assets/customer-refunds-create.json`);
const customerRefundsUpdatePayload = tools.requirePayload(`${__dirname}/assets/customer-refunds-update.json`);

const options = {
  churros: {
    updatePayload: customerRefundsUpdatePayload
  }
};

suite.forElement('erp', 'customer-refunds', { payload: customerRefundsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
});