'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const employeePayload = tools.requirePayload(`${__dirname}/assets/employee.json`);
const employeeUpdatePayload = tools.requirePayload(`${__dirname}/assets/employeeUpdate.json`);

suite.forElement('employee', 'employees', (test) => {

  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "status='ACTIVE'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.status === 'ACTIVE')).to.not.be.empty)
    .withName(`should allow GET where status='active'`)
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "begin_updated_at='2017-10-17T19:11:18Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated_at >= '2017-10-17T19:11:18Z')).to.not.be.empty)
    .withName(`should allow GET with where begin_updated_at=...`)
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "end_updated_at='2017-10-16T19:11:18Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated_at <= '2017-10-16T19:11:18Z')).to.not.be.empty)
    .withName(`should allow GET with where end_updated_at=...`)
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "begin_created_at='2017-09-15T19:58:11Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.created_at >= '2017-10-16T19:11:18Z')).to.not.be.empty)
    .withName(`should allow GET with where begin_created_at=...`)
    .should.return200OnGet();

  let empId, roleId;
  before(() => cloud.get(`hubs/employee/roles`)
    .then(r => roleId = r.body[0].id)
    .then(r => employeePayload.role_ids = roleId)
    .then(r => employeeUpdatePayload.role_ids = roleId));

  it('should allow CRU for /employees', () => {
    return cloud.post(test.api, employeePayload)
      .then(r => empId = r.body.id)
      .then(r => cloud.get(`${test.api}/${empId}`))
      .then(r => cloud.patch(`${test.api}/${empId}`, employeeUpdatePayload));
  });
});