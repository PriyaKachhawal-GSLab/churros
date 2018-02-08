'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

let payload = tools.requirePayload(`${__dirname}/assets/employee.json`);
payload["EmployeeId"] = Math.floor(1000 + Math.random() * 9000);

suite.forElement('finance', 'employees', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.should.supportPagination();
});
