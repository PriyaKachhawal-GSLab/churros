'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
let payload = tools.requirePayload(`${__dirname}/assets/available-times.json`);

suite.forElement('scheduling', 'available', { payload: payload }, (test) => {
  let appointmentTypeID;
  before(() => cloud.get('/hubs/scheduling/appointment-types')
    .then(r => appointmentTypeID = r.body[0].id)
    .then(r => payload.appointmentTypeID = appointmentTypeID));

  it(`should allow POST ${test.api}-times/validate`, () => {
    return cloud.post(`${test.api}-times/validate`, payload)
      .then(r => expect(r.body).to.not.be.empty);
  });
});
