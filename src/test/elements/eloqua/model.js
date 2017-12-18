'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const model = require('core/model');

suite.forElement('marketing', 'model', (test) => {

  
    it('should allow model vallidation for /hubs/marketing/accounts', () => {
       return cloud.get(`/hubs/marketing/accounts`)
       .then(r => model.validateResponseModel(r, 'getAccounts'))
       .then(r =>cloud.get(`/hubs/marketing/accounts/${r.body[0].id}`))
       .then(r => model.validateResponseModel(r, 'getAccountById'));
     });


     it('should allow model vallidation for /hubs/marketing/contacts', () => {
        return cloud.get(`/hubs/marketing/contacts`)
        .then(r => model.validateResponseModel(r, 'getContacts'))
        .then(r => cloud.get(`/hubs/marketing/contacts/${r.body[0].id}`))
        .then(r => model.validateResponseModel(r, 'getContactById'));
      });
      it('should allow model vallidation for /hubs/marketing/campaigns', () => {
         return cloud.get(`/hubs/marketing/campaigns`)
         .then(r => model.validateResponseModel(r, 'getCampaigns'))
         .then(r => cloud.get(`/hubs/marketing/campaigns/${r.body[0].id}`))
         .then(r => model.validateResponseModel(r, 'getCampaignById'));
       });

});
