'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/currencies.json`);

suite.forElement('erp', 'currencies', { payload: payload }, (test) => {
payload.symbol = tools.randomStr("AMNBGHJOPEIOU", 3);
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
});
