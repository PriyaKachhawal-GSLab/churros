'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/access-control-list.json`);
const calendarsPayload = tools.requirePayload(`${__dirname}/assets/calendars.json`);

suite.forElement('general', 'calendars', { payload: payload }, (test) => {
  let calendarId;
  before(() => cloud.post(test.api, calendarsPayload)
    .then(r => calendarId = r.body.id));

  it('should test CRUDS of  /access-control-list', () => {
    return cloud.cruds(`${test.api}/${calendarId}/access-control-list`, payload);
  });


  it('should test where for /access-control-list', () => {
    return cloud.withOptions({ qs: { where: `showDeleted='true'` } }).get(`${test.api}/${calendarId}/access-control-list`)
      .then(r => {
        expect(r.body.length).to.not.be.empty;
      });
  });

  after(() => cloud.delete(`${test.api}/${calendarId}`));
});
