'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const expenseReportsCreatePayload = tools.requirePayload(`${__dirname}/assets/expense-reports-create.json`);
const expenseReportsUpdatePayload = tools.requirePayload(`${__dirname}/assets/expense-reports-update.json`);

const options = {
  churros: {
    updatePayload: expenseReportsUpdatePayload
  }
};

suite.forElement('erp', 'expense-reports', { payload : expenseReportsCreatePayload, skip : true }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});