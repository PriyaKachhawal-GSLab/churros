'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let payload = tools.requirePayload(`${__dirname}/assets/employee.json`);
payload.EmployeeId = Math.floor(1000 + Math.random() * 9000);

suite.forElement('erp', 'employees', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.should.supportPagination();
});
