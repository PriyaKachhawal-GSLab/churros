'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('./assets/projects');

payload.entityId += tools.random();

suite.forElement('erp', 'projects', { payload: payload }, (test) => {
  test.should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  //test.should.supportCeqlSearch('id');
});
