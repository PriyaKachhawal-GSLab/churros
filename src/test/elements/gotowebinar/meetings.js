'use strict';

const suite = require('core/suite');
const payload = require('./assets/meetings');
const cloud = require('core/cloud');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const meetingsPayload = build({ subject: tools.random(), description: tools.random() });
const coorganizerPayload = [{
  "external": true,
  "organizerKey": "3783671677592119301",
  "givenName": tools.random(),
  "email": tools.randomEmail()
}];
const userPayload = {
  "firstName": tools.random(),
  "lastName": tools.random(),
  "email": tools.randomEmail(),
  "source": tools.random(),
  "address": tools.random(),
  "city": tools.random(),
  "state": tools.random(),
  "zipCode": tools.random(),
  "country": tools.random(),
  "phone": tools.random(),
  "organization": tools.random(),
  "jobTitle": tools.random(),
  "questionsAndComments": tools.random(),
  "industry": tools.random(),
  "numberOfEmployees": tools.random(),
  "purchasingTimeFrame": tools.random(),
  "purchasingRole": tools.random(),
  "responses": [{
    "questionKey": 0,
    "responseText": tools.random(),
    "answerKey": 0
  }]
};

suite.forElement('conferencing', 'meetings', { payload: payload }, (test) => {
  let webinarKey;
  it('should allow CRUDS for /hubs/conferencing/meetings and then GET for /meetings/times,/meetings/upcoming and /meetings/history by meetingId', () => {
    return cloud.post(test.api, payload)
      .then(r => webinarKey = r.body.id)
      .then(r => cloud.get(`${test.api}/${webinarKey}`))
      .then(r => cloud.patch(`${test.api}/${webinarKey}`, meetingsPayload))
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${webinarKey}/times`))
      .then(r => cloud.get(`${test.api}/upcoming`))
      .then(r => cloud.withOptions({ qs: { where: 'fromTime=\'2015-11-03T14:00:00Z\' AND toTime=\'2020-11-03T14:00:00Z\'' } }).get(`${test.api}/history`))
      .then(r => cloud.withOptions({ qs: { where: 'fromTime=\'2015-11-03T14:00:00Z\' AND toTime=\'2020-11-03T14:00:00Z\'' } }).get(test.api))
      .then(r => cloud.delete(`${test.api}/${webinarKey}`));
  });

  it('should allow GET for /hubs/conferencing/sessions and then GET for /hubs/conferencing/meetings/:id/sessions/:sessionId/attendees', () => {
    let sessionKey;
    // let attendeeKey;
    return cloud.withOptions({ qs: { where: 'fromTime=\'2000-11-03T14:00:00Z\' AND toTime=\'2020-11-03T14:00:00Z\'' } }).get(`/hubs/conferencing/sessions`)
      .then(r => webinarKey = r.body[0].webinarKey)
      .then(r => cloud.get(`${test.api}/${webinarKey}/sessions`))
      .then(r => sessionKey = r.body[0].sessionKey)
      .then(r => cloud.get(`${test.api}/${webinarKey}/sessions/${sessionKey}`))
      .then(r => cloud.get(`${test.api}/${webinarKey}/session/${sessionKey}/attendees`)); //commenting as there isn't antendees for a newly created meeting
      // .then(r => attendeeKey = r.body[0].registrantKey)
      // .then(r => cloud.get(`${test.api}/${webinarKey}/session/${sessionKey}/attendees/${attendeeKey}`));
  });

  it('should allow CRD for /hubs/conferencing/meetings/:id/co-organizers', () => {
    let memberKey;
    return cloud.post(test.api, meetingsPayload)
      .then(r => webinarKey = r.body.id)
      .then(r => cloud.post(`${test.api}/${webinarKey}/co-organizers`, coorganizerPayload))
      .then(r => memberKey = r.body[0].memberKey)
      .then(r => cloud.get(`${test.api}/${webinarKey}/co-organizers`))
      .then(r => cloud.withOptions({ qs: { external: 'true' } }).delete(`${test.api}/${webinarKey}/co-organizers/${memberKey}`))
      .then(r => cloud.delete(`${test.api}/${webinarKey}`));
  });

  it('should allow CRDS for /hubs/conferencing/meetings/:id/users', () => {
    let userKey;
    return cloud.post(test.api, meetingsPayload)
      .then(r => webinarKey = r.body.id)
      .then(r => cloud.post(`${test.api}/${webinarKey}/users`, userPayload))
      .then(r => userKey = r.body.registrantKey)
      .then(r => cloud.get(`${test.api}/${webinarKey}/users`))
      .then(r => cloud.get(`${test.api}/${webinarKey}/users/${userKey}`))
      .then(r => cloud.delete(`${test.api}/${webinarKey}/users/${userKey}`))
      .then(r => cloud.delete(`${test.api}/${webinarKey}`));
  });
});
