'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
let payload = tools.requirePayload(`${__dirname}/assets/available-times.json`);

suite.forElement('scheduling', 'available', { payload: payload }, (test) => {
  let month = '2019-02';
  let date = '2019-02-06';
  let appointmentTypeID;
  before(() => cloud.get('/hubs/scheduling/appointment-types')
    .then(r => appointmentTypeID = r.body[0].id)
    .then(r => payload.appointmentTypeID = appointmentTypeID));

  it(`should allow GET ${test.api}-dates`, () => {
    return cloud.withOptions({ qs: { month: `${month}`, appointmentTypeID: `${appointmentTypeID}` } }).get(`${test.api}-dates`);
  });

  it(`should allow GET ${test.api}-times`, () => {
    return cloud.withOptions({ qs: { date: `${date}`, appointmentTypeID: `${appointmentTypeID}` } }).get(`${test.api}-times`);
  });

  it(`should allow POST ${test.api}-times/validate`, () => {
    return cloud.post(`${test.api}-times/validate`, payload)
      .then(r => expect(r.body).to.not.be.empty);
  });
});
