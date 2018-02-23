'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

let payload = tools.requirePayload(`${__dirname}/assets/employee.json`);
payload.EmployeeId = Math.floor(1000 + Math.random() * 9000);

suite.forElement('erp', 'employees', { payload: payload }, (test) => {
  test.withOptions({ skip: true }).should.supportCrus();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'filter = \'active\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.Inactive = 'false');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
