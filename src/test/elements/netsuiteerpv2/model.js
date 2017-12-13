'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const model = require('core/model');


suite.forElement('erp', 'model', (test) => {

    it('should allow model vallidation for /hubs/erp/bills', () => {
       return cloud.get('/hubs/erp/bills')
       .then(r => model.validateResponseModel(r, 'getBills'));
    //   .then(r =>cloud.withOptions({qs:{where:`username='jiradev'`, page: 1, pageSize: 1 }}).get(`/hubs/helpdesk/agents/${r.body[0].key}`))
     //  .then(r => model.validateResponseModel(r, 'getAgentById'));
     });

    // it('should allow model vallidation for /hubs/erp/incidents', () => {
    //     return cloud.get('/hubs/helpdesk/incidents')
    //     .then(r => model.validateResponseModel(r, 'getIncidents'))
    //     .then(r =>cloud.get(`/hubs/helpdesk/agents/${r.body[0].id}`))
    //     .then(r => model.validateResponseModel(r, 'getIncidentByIncidentId'));
    //   });    
});
