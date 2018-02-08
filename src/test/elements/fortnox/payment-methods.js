'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const payload = tools.requirePayload(`${__dirname}/assets/payment-method.json`);

suite.forElement('finance', 'payment-methods', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.should.supportPagination();
});
