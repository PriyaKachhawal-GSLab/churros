'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/agents.json`);

suite.forElement('helpdesk', 'agents', (test) => {
  it(`should allow CRDS for ${test.api} with Ceql search`, () => {
    let agentId;
    return cloud.post(test.api, payload)
      .then(r => agentId = r.body.key)
      .then(r => cloud.get(`${test.api}/${agentId}`))
      .then(r => cloud.withOptions({ qs: {where:`username='jiradev'`}}).get(test.api))
      .then(r => cloud.delete(`${test.api}/${agentId}`));
   });
test.withOptions({ qs: {where:`username='jiradev'`}}).should.supportPagination();
});
