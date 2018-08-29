'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/agents.json`);

suite.forElement('helpdesk', 'agents',{payload:payload}, (test) => {
  test.should.supportCrd();
  test.withOptions({ qs: {where:`username='jiradev'`}}).should.supportPagination();
  test.withName('should support Ceql search').withOptions({ qs: {where:`username='jiradev'`} }).should.return200OnGet();
});
