'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/calendars.json`);

suite.forElement('scheduling', 'calendars', { payload: payload }, (test) => {
  test.should.supportCrud();

  test.withApi(`${test.api}/sync-tokens`).should.return200OnGet();
});
