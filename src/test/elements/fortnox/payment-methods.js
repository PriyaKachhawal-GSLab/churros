'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const payload = tools.requirePayload(`${__dirname}/assets/payment-method.json`);

suite.forElement('erp', 'payment-methods', { payload: payload, skip : true }, (test) => {
  test.should.supportCrus();
  test.should.supportPagination();
});
