const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const timeSheetPayload = tools.requirePayload(`${__dirname}/assets/timesheet.json`);
const timeSheetUpdatePayload = tools.requirePayload(`${__dirname}/assets/timesheetUpdate.json`);

suite.forElement('employee', 'timesheets', (test) => {
  let empId;
  before(() => cloud.get('/employees')
    .then(r => {
      empId = r.body[0].id;
      timeSheetPayload.employee.id = empId;
      timeSheetUpdatePayload.employee.id = empId;
    })
  );
  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "in_time>=1508943600000" } })
    .withValidation(r => expect(r.body.filter(obj => obj.inTime > '1508943600000')).to.not.be.empty)
    .withName('should allow GET with option in_time')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "server_banking='false'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.serverBanking === false)).to.not.be.empty)
    .withName('should allow GET with option server_banking')
    .should.return200OnGet();

  it('should allow CRUDS for timesheets', () => {
    let tId;
    return cloud.post(test.api, timeSheetPayload)
      .then(r => tId = r.body.id)
      .then(r => cloud.get(`${test.api}/${tId}`))
      .then(r => cloud.patch(`${test.api}/${tId}`, timeSheetUpdatePayload))
      .then(r => cloud.withOptions({ qs: { employeeId: `${empId}` } }).delete(`${test.api}/${tId}`))
      .then(r => cloud.get(test.api));
  });
});
