'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const touchCreatePayload = tools.requirePayload(`${__dirname}/assets/touchCreate.json`);

suite.forElement('rewards', 'touches', { payload: touchCreatePayload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});
