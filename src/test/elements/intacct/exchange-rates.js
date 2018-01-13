'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/exchange-rates.json`);

suite.forElement('payment', 'exchange-rates', { payload: payload }, (test) => {
  test.should.supportCrs();
  test.should.supportPagination();
});
