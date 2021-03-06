'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const tools = require('core/tools');
let payload = tools.requirePayload(`${__dirname}/assets/appointments.json`);

suite.forElement('scheduling', 'appointments', { payload: payload }, (test) => {
  let appointmentId, appointmentTypeID, email;
  let reschedulePayload = {};
  // Generate future date in desired format
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  let futureDate = year + "-" + month + "-" + day;

  // First get an available appointment time, and then schedule appointment for that time
  before(() => cloud.get('/hubs/scheduling/appointment-types')
    .then(r => appointmentTypeID = r.body[0].id)
    .then(r => payload.appointmentTypeID = appointmentTypeID)
    .then(r => cloud.withOptions({ qs: { date: `${futureDate}` } }).get(`/hubs/scheduling/appointment-types/${appointmentTypeID}/available-times`))
    .then(r => payload.datetime = r.body[0].time)
    .then(r => cloud.post(test.api, payload))
    .then(r => {
      appointmentId = r.body.id;
      email = r.body.email;
    })
    .then(r => cloud.withOptions({ qs: { date: `${futureDate}` } }).get(`/hubs/scheduling/appointment-types/${appointmentTypeID}/available-times`))
    .then(r => payload.datetime = r.body[0].time)
    .then(r => cloud.withOptions({ qs: { date: `${futureDate}` } }).get(`/hubs/scheduling/appointment-types/${appointmentTypeID}/available-times`))
    .then(r => reschedulePayload.datetime = r.body[0].time));

  const options = {
    churros: {
      updatePayload: {
        "email": "alan.phil.stu@vegas.com"
      }
    }
  };

  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: `email = '${email}'` } })
    .withName('should support appointments Ceql search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.email = 'ab@gmail.com');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  it(`should allow GET appointment-types/{id}/available-dates`, () => {
    let appointmentMonth = year + "-" + month;
    return cloud.withOptions({ qs: { month: `${appointmentMonth}` } }).get(`/hubs/scheduling/appointment-types/${appointmentTypeID}/available-dates`);
  });

  it(`should allow GET appointment-types/{id}/available-times`, () => {
    return cloud.withOptions({ qs: { date: `${futureDate}` } }).get(`/hubs/scheduling/appointment-types/${appointmentTypeID}/available-times`);
  });

  it('should allow GET /appointments/{id}/payments', () => {
    return cloud.get(`${test.api}/${appointmentId}/payments`);
  });

  it('should allow PATCH /appointments/{id}/reschedule', () => {
    return cloud.patch(`${test.api}/${appointmentId}/reschedule`, reschedulePayload)
      .then(r => expect(r.body).to.not.be.empty);
  });

  it('should allow GET /appointments/{id}/payments', () => {
    return cloud.get(`${test.api}/${appointmentId}/payments`);
  });

  it('should allow GET /appointments-types', () => {
    return cloud.get('/hubs/scheduling/appointment-types');
  });
  test.withApi('/hubs/scheduling/appointment-types').should.supportPagination();

  after(() => test.withApi(`/hubs/scheduling/appointments/${appointmentId}`).should.return404OnDelete());
});
