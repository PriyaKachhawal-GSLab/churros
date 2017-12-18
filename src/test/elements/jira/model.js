'use strict';

const suite = require('core/suite');
const model = require('core/model');
const cloud = require('core/cloud');


suite.forElement('helpdesk', 'model', (test) => {

    it('should allow model vallidation for /hubs/helpdesk/agents', () => {      
      
        return cloud.withOptions({qs:{where:`username='jiradev'`}}).get('/hubs/helpdesk/agents')
       .then(r => model.validateResponseModel(r, 'getAgents'))
       .then(r =>cloud.withOptions({qs:{where:`username='jiradev'`, page: 1, pageSize: 1 }}).get(`/hubs/helpdesk/agents/${r.body[0].key}`))
       .then(r => model.validateResponseModel(r, 'getAgentById'));         
    
    });
});
