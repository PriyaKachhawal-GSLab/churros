'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const agentsPayload = tools.requirePayload(`${__dirname}/assets/agents-create.json`);
const agentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/agents-update.json`);

suite.forElement('helpdesk', 'agents', { payload: agentsPayload }, (test) => {
  it('should allow CRUDS /hubs/helpdesk/agents ', () => {
    let agentId;
    return cloud.post(test.api, agentsPayload)
      .then(r => agentId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${agentId}`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${agentId}'` } }).get(test.api))
      .then(r => cloud.patch(`${test.api}/${agentId}`, agentsUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${agentId}`));
  });
});
