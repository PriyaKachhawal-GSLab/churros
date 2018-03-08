'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/states.json`);

suite.forElement('erp', 'states', { payload: payload }, (test) => {
payload.shortname = tools.randomStr("AMNBGHJOPEIOU", 3);
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
});
