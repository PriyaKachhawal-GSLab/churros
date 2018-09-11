'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const employeesCreatePayload = tools.requirePayload(`${__dirname}/assets/employees-create.json`);
const employeesUpdatePayload = tools.requirePayload(`${__dirname}/assets/employees-update.json`);

const options = {
  churros: {
    updatePayload: employeesUpdatePayload
  }
};

suite.forElement('erp', 'employees', { payload : employeesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});