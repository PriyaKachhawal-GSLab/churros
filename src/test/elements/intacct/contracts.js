'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contracts.json`);

suite.forElement('payment', 'contracts', { payload: payload}, (test) => {
  test.should.supportCruds();
  test.should.supportNextPagePagination(2);
});