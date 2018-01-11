'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'agents', (test) => {
  let agentId;
  it('should allow get for /agents', () => {
//"jiradev" is hardcoded as get all api has "username" constraint".
    return cloud.withOptions({qs:{where:`username='jiradev'`}}).get('/hubs/helpdesk/agents')
    .then(r => cloud.withOptions({qs:{where:`username='jiradev'`, page: 1, pageSize: 1 }}).get('/hubs/helpdesk/agents'))
   .then(r => agentId = r.body[0].key)
    .then(r => cloud.get("/hubs/helpdesk/agents/" + agentId));
  });
});
