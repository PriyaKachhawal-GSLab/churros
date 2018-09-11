'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const customersCreatePayload = tools.requirePayload(`${__dirname}/assets/customers-create.json`);
const customersUpdatePayload = tools.requirePayload(`${__dirname}/assets/customers-update.json`);

const options = {
  churros: {
    updatePayload: customersUpdatePayload
  }
};

suite.forElement('erp', 'customers', { payload : customersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});