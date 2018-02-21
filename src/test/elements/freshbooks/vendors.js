'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/vendors.json`);

suite.forElement('finance', 'vendors', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});
