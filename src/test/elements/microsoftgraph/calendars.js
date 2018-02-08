'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/calendars.json`);
const cloud = require('core/cloud');

suite.forElement('general', 'calendars', { payload: payload }, (test) => {
  test.should.supportCrud();
  test.should.supportPagination();
  // the CEQL values are hard coded in do to a problem with microsoft api's that don't allow you to create a calendar, query, and delete it
  it('should allow CEQL', () => {
    return cloud.get(`${test.api}?where=name%3D'sample%20for%20display7'`)
      .then(r => function() {
        (r.body[0].name).should.equal("sample for display7");
      });
  });

});
