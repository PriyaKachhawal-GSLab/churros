'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const timeSheetPayload = tools.requirePayload(`${__dirname}/assets/timesheet.json`);
const timeSheetUpdatePayload = tools.requirePayload(`${__dirname}/assets/timeSheetUpdate.json`);

suite.forElement('employee', 'timesheets', (test) => {
  let empId;
  before(() => cloud.get('/employees')
    .then(r => {
      expect(r.body).to.not.be.empty;
      empId = r.body[0].id;
      timeSheetPayload.employee_id = empId;
      timeSheetUpdatePayload.employee_id = empId;
    }));

  test.should.supportPagination();

  test.withApi(test.api)
    .withOptions({ qs: { where: "end_clockout_time='2017-11-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.clockout_time <= '2017-11-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option end_clockout_time')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "deleted='false'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.deleted === false)).to.not.be.empty)
    .withName('should allow GET with option deleted')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "begin_updated_at='2017-10-01T17:49:02Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated_at >= '2017-10-01T17:49:02Z')).to.not.be.empty)
    .withName('should allow GET with option begin_updated_at')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "end_updated_at='2017-10-04T17:49:02Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated_at <= '2017-10-04T17:49:02Z')).to.not.be.empty)
    .withName('should allow GET with option end_updated_at')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "begin_clockin_time='1998-11-15T09:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.clockin_time >= '2017-10-01T17:49:02Z')).to.not.be.empty)
    .withName('should allow GET with option begin_clockin_time')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "end_clockin_time='2017-11-15T09:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.clockin_time <= '2017-10-01T17:49:02Z')).to.not.be.empty)
    .withName('should allow GET with option end_clockin_time')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "begin_clockout_time='2015-11-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.clockout_time >= '2016-10-01T17:49:02Z')).to.not.be.empty)
    .withName('should allow GET with option begin_clockout_time')
    .should.return200OnGet();

  it(`should allow GET with option employee_id for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `employeeId = '${empId}'` } }).get(test.api)
      .then(r => expect(r.body.filter(obj => obj.employeeId === empId)).to.not.be.null);
  });

  it('should allow CRU for timesheets', () => {
    let tsId;
    return cloud.post(test.api, timeSheetPayload)
      .then(r => tsId = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${tsId}`))
      .then(r => cloud.patch(`${test.api}/${tsId}`, timeSheetUpdatePayload));
  });
});
