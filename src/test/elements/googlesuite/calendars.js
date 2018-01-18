'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/calendars.json`);

suite.forElement('general', 'calendars', { payload: payload }, (test) => {
  test.should.supportCrud();
});
