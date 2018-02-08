'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/events.json`);
const calendarsPayload = tools.requirePayload(`${__dirname}/assets/calendars.json`);
suite.forElement('general', 'events', { payload: payload }, (test) => {
  let calendarId;
  test.api = "/hubs/general/calendars";
  before(() => cloud.post(test.api, calendarsPayload)
    .then(r => calendarId = r.body.id));

  it('should test CRUDS of events', () => {
    return cloud.cruds(`${test.api}/${calendarId}/events`, payload);
  });

});
