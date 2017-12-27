'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const calendarsPayload = tools.requirePayload(`${__dirname}/assets/calendars.json`);

suite.forElement('general', 'calendar-list', null, (test) => {
  let calendarId;
  before(() => cloud.post(`/hubs/scheduling/calendars`, calendarsPayload)
  .then(r => calendarId = r.body.id));

  it('should test CRUDS of /calendar-list', () => {
  return cloud.cruds(test.api, { "id":calendarId });
  });

  test.should.supportNextPagePagination(1);

  it('should test where for /calendar-list', () => {
         return cloud.withOptions({ qs: { where : `minAccessRole='owner'` } }).get(test.api)
      .then(r => {
           expect(r.body.length).to.not.be.empty;
      });
  });
 
  after(() => cloud.delete(`/hubs/scheduling/calendars/${calendarId}`));
});
