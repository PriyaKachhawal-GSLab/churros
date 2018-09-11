'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const customerStatusesCreatePayload = tools.requirePayload(`${__dirname}/assets/customer-statuses-create.json`);
const customerStatusesUpdatePayload = tools.requirePayload(`${__dirname}/assets/customer-statuses-update.json`);

const options = {
  churros: {
    updatePayload: customerStatusesUpdatePayload
  }
};

suite.forElement('erp', 'customer-statuses', { payload: customerStatusesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});