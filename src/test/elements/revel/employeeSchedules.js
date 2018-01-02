const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const employeeSchedulePayload = tools.requirePayload(`${__dirname}/assets/employeeSchedule.json`);
const employeeScheduleUpdatePayload = tools.requirePayload(`${__dirname}/assets/employeeScheduleUpdate.json`);


suite.forElement('employee', 'employee-schedules', (test) => {

  before(() => {
    return cloud.get('/users')
      .then(r => {
        employeeSchedulePayload.created_by = r.body[0].resource_uri;
        employeeSchedulePayload.updated_by = r.body[0].resource_uri;
      })
      .then(r => cloud.get('/roles')
        .then(r => employeeSchedulePayload.role = r.body[0].resource_uri))

      .then(r => cloud.get('/employees')
        .then(r => employeeSchedulePayload.employee = r.body[0].resource_uri))

      .then(r => cloud.get('/departments')
        .then(r => employeeSchedulePayload.department = r.body[0].resource_uri))

      .then(r => cloud.get('/locations')
        .then(r => employeeSchedulePayload.establishment = r.body[0].resource_uri))

      .then(r => {
        var utcDate = new Date(new Date().toUTCString());
        utcDate.setHours(utcDate.getHours() + 5);
        let begin = utcDate.toISOString().split('.')[0];
        utcDate.setHours(utcDate.getHours() + 8);
        let end = utcDate.toISOString().split('.')[0];
        employeeSchedulePayload.shift_begin_time = begin;
        employeeSchedulePayload.shift_end_time = end;
      });
  });

  test.withApi(test.api)
    .withOptions({ qs: { where: "updated_date__lte='2017-11-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.updated_date <= '2017-11-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option updated_date__lte')
    .should.return200OnGet();

  test.withApi(test.api)
    .withOptions({ qs: { where: "created_date__gte='2017-09-15T16:00:00Z'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.created_date >= '2017-09-15T16:00:00Z')).to.not.be.empty)
    .withName('should allow GET with option created_date__gte')
    .should.return200OnGet();

  test.should.supportPagination();

  it('Should allow CRUS for employeeSchedules', () => {
    let esId;
    return cloud.post(test.api, employeeSchedulePayload)
      .then(r => esId = r.body.id)
      .then(r => cloud.get(`${test.api}/${esId}`))
      .then(r => cloud.patch(`${test.api}/${esId}`, employeeScheduleUpdatePayload))
      .then(r => cloud.withOptions({ qs: { reason: 'xyz', details: 'xyz', description: 'xyz' } }).delete(`${test.api}/${esId}`))
      .then(r => cloud.get(test.api));
  });

});
