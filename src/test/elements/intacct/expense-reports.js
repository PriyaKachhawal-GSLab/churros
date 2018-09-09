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

suite.forElement('finance', 'expense-reports', { payload: expenseReportsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('expensereportno');
});