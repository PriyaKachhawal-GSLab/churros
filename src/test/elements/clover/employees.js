const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const employeePayload = tools.requirePayload(`${__dirname}/assets/employee.json`);
const employeeUpdatePayload = tools.requirePayload(`${__dirname}/assets/employeeUpdate.json`);

suite.forElement('employee', 'employees', (test) => {

  before(() => {
    return cloud.get('/roles')
      .then(r => employeePayload.role = r.body[0].systemRole);
  });
  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "modifiedTime>1508943600000" } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .withName('should allow GET with option modifiedTime')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "role='EMPLOYEE'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.role === 'EMPLOYEE')).to.not.be.empty)
    .withName('should allow GET with option role')
    .should.return200OnGet();

  it('should allow CRUDS for employees', () => {
    let empId;
    return cloud.post(test.api, employeePayload)
      .then(r => empId = r.body.id)
      .then(r => cloud.get(`${test.api}/${empId}`))
      .then(r => cloud.patch(`${test.api}/${empId}`, employeeUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${empId}`))
      .then(r => cloud.get(test.api))
      .then(r => expect(r.body.filter(obj => isNaN(obj.pin) === false)).to.not.be.empty);
  });
});
