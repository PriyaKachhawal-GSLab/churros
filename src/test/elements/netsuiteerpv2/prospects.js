'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/prospects.json`);

suite.forElement('erp', 'prospects', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  //test.should.supportCeqlSearch('id');
});
