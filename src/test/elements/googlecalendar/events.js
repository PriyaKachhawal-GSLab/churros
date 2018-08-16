'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/events.json`);
const calendarsPayload = tools.requirePayload(`${__dirname}/assets/calendars.json`);

suite.forElement('scheduling', 'calendars', { payload: payload }, (test) => {
  let calendarId;
  before(() => cloud.post(test.api, calendarsPayload)
    .then(r => calendarId = r.body.id));
    
  after(() => cloud.delete(`${test.api}/${calendarId}`));

  it(`should allow CRUDS for ${test.api}/:id/events`, () => {
    return cloud.cruds(`${test.api}/${calendarId}/events`, payload);
  });

  test.withApi(`${test.api}/primary/events`).should.supportPagination('id');

  it(`should allow where for ${test.api}/:id/events`, () => {
    let eventId;
    return cloud.post(`${test.api}/${calendarId}/events`, payload)
      .then(r => eventId = r.body.id)
      .then(r => cloud.withOptions({ qs: { where: `maxAttendees=1` } }).get(`${test.api}/${calendarId}/events`))
      .then(r => expect(r.body).to.not.be.empty)
      .then(r => cloud.delete(`${test.api}/${calendarId}/events/${eventId}`));
  });

  it(`should allow showDeleted for ${test.api}/:id/events`, () => {
    let eventId, bodyWithDeleted;
    return cloud.post(`${test.api}/${calendarId}/events`, payload)
      .then(r => eventId = r.body.id)
      .then(r => cloud.get(`${test.api}/${calendarId}/events`))
      .then(r => {
        expect(r.body).to.not.be.empty;
        bodyWithDeleted = r.body;
      })
      .then(r => cloud.withOptions({ qs: { where: `showDeleted='false'` } }).get(`${test.api}/${calendarId}/events`))
      .then(r => {
        expect(r.body).to.not.be.empty;
        let filteredBody = bodyWithDeleted.filter(o => o.status !== 'cancelled');
        expect(filteredBody).to.not.be.empty;
        expect(filteredBody).to.deep.equal(r.body);
      })
      .then(r => cloud.delete(`${test.api}/${calendarId}/events/${eventId}`));
  });
});