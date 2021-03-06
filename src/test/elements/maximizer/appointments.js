'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const appointmentPayload = tools.requirePayload(`${__dirname}/assets/appointments.json`);

// Appointment scheduled in one hour from current time
appointmentPayload.StartDate = new Date(Date.now() + 3600000).toISOString();
appointmentPayload.EndDate = new Date(Date.now() + 4600000).toISOString();

suite.forElement('crm', 'appointments', { payload : appointmentPayload }, (test) => {
  let appointmentRespBody;
  test.should.supportPagination("id");

  before(() =>
    cloud.post(test.api, appointmentPayload)
    .then(r => {
      appointmentRespBody = r.body;
      appointmentRespBody.Subject = 'ChurrosTestUpdate';
    })
    .then(() => cloud.patch(`${test.api}/${appointmentRespBody.id}`, appointmentRespBody)));

  after(() => cloud.delete(`${test.api}/${appointmentRespBody.id}`));

  test.withApi(test.api)
      .withOptions({ qs: { where: `Subject='${appointmentPayload.Subject}'`, fields: `Subject,StartDate` } })
      .withValidation(r => {
         expect(r.body.filter(obj => obj.Subject === appointmentPayload.Subject).length).to.equal(r.body.length);
         expect(Object.keys(r.body[0]).length).to.equal(2);
      })
      .withName('should allow GET with options /appointments')
      .should.return200OnGet();

});
