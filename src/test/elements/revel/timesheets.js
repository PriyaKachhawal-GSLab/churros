const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const timeSheetPayload = tools.requirePayload(`${__dirname}/assets/timesheet.json`);
const timeSheetUpdatePayload = tools.requirePayload(`${__dirname}/assets/timeSheetUpdate.json`);

suite.forElement('employee', 'timesheets', (test) => {

  before(() => {
    return cloud.get('/users')
      .then(r => {
        timeSheetPayload.created_by = r.body[0].resource_uri;
        timeSheetPayload.updated_by = r.body[0].resource_uri;
      })
      .then(r => cloud.get('/employees')
        .then(r => timeSheetPayload.employee = r.body[0].resource_uri))
      .then(r => cloud.get('/locations')
        .then(r => timeSheetPayload.establishment = r.body[0].resource_uri))
      .then(r => {
        var utcDate = new Date(new Date().toUTCString());
        utcDate.setHours(utcDate.getHours() + 5); //Current PST time
        let cin = utcDate.toISOString().split('.')[0];
        utcDate.setHours(utcDate.getHours() + 8);
        let cout = utcDate.toISOString().split('.')[0];
        timeSheetPayload.clock_in = cin;
        timeSheetPayload.clock_out = cout;
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


  it('Should allow CRUS for timesheets', () => {
    let timesheetId;
    return cloud.post(test.api, timeSheetPayload)
      .then(r => timesheetId = r.body.id)
      .then(r => cloud.get(`${test.api}/${timesheetId}`))
      .then(r => cloud.patch(`${test.api}/${timesheetId}`, timeSheetUpdatePayload))
      .then(r => cloud.get(test.api));
  });
});
