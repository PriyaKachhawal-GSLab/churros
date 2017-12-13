'use strict';

const suite = require('core/suite');

const model = require('core/model');


suite.forElement('crm', 'model', (test) => {
   
   it('should allow model vallidation for /hubs/helpdesk/agents', () => {
        return model.checkDuplicateModel();
   });
  
    // it('should allow model vallidation for /hubs/helpdesk/agents', () => {
    //    return cloud.withOptions({qs:{where:`username='jiradev'`}}).get('/hubs/helpdesk/agents')
    //    .then(r => model.validateResponseModel(r, 'getAgents'))
    //    .then(r =>cloud.withOptions({qs:{where:`username='jiradev'`, page: 1, pageSize: 1 }}).get(`/hubs/helpdesk/agents/${r.body[0].key}`))
    //    .then(r => model.validateResponseModel(r, 'getAgentById'));
    //  });

    // it('should allow model vallidation for /hubs/helpdesk/incidents', () => {
    //     return cloud.get('/hubs/helpdesk/incidents')
    //     .then(r => model.validateResponseModel(r, 'getIncidents'))
    //     .then(r =>cloud.get(`/hubs/helpdesk/agents/${r.body[0].id}`))
    //     .then(r => model.validateResponseModel(r, 'getIncidentByIncidentId'));
    //   });    
});
