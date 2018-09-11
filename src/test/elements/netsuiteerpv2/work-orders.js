'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const workOrdersCreatePayload = tools.requirePayload(`${__dirname}/assets/work-orders-create.json`);
const workOrdersUpdatePayload = tools.requirePayload(`${__dirname}/assets/work-orders-update.json`);

const options = {
  churros: {
    updatePayload: workOrdersUpdatePayload
  }
};

suite.forElement('erp', 'work-orders', { payload : workOrdersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});