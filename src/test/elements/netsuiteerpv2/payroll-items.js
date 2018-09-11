'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const payrollItemsCreatePayload = tools.requirePayload(`${__dirname}/assets/payroll-items-create.json`);
const payrollItemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/payroll-items-update.json`);

const options = {
  churros: {
    updatePayload: payrollItemsUpdatePayload
  }
};

suite.forElement('erp', 'payroll-items', { payload : payrollItemsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});