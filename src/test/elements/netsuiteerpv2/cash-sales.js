'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const cashSalesCreatePayload = tools.requirePayload(`${__dirname}/assets/cash-sales-create.json`);
const cashSalesUpdatePayload = tools.requirePayload(`${__dirname}/assets/cash-sales-update.json`);

const options = {
  churros: {
    updatePayload: cashSalesUpdatePayload
  }
};

suite.forElement('erp', 'cash-sales', { payload: cashSalesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});