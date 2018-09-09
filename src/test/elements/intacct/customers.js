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

suite.forElement('finance', 'customers', { payload: customersCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
