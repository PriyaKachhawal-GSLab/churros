'use strict';

const suite = require('core/suite');
const listPayload = require('./assets/listLead');
const leadPayload = require('./assets/leads');
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;


suite.forElement('crm', 'lists/{id}/leads', { payload: listPayload }, (test) => {

  it('Test for /list/{id}/leads', () => {
      var listId = null;
      var leadId = null;
      return cloud.post(test.api, listPayload)
        .then(r => listId = r.body.id)
        .then(r => cloud.post(`/leads`,leadPayload))
        .then(r => leadId = r.body.id)
        .then(() => cloud.patch(`/lists/${listId}/leads/${leadId}`))
        .then(() => cloud.withOptions({ qs: { where: `entityid='${leadId}'`}}).get(`/lists/${listId}/leads`, (r) => {
          expect(r.body).to.have.lengthOf(1);
        }))
        .then(r => cloud.delete(`/lists/${listId}/leads/${leadId}`))
        .then(() => cloud.withOptions({ qs: { where: `entityid='${leadId}'`}}).get(`/lists/${listId}/leads`, (r) => {
          expect(r.body).to.have.lengthOf(0);
        }))
        .then(r => cloud.delete(`/lists/${listId}`))
        .then(r => cloud.delete(`/leads/${leadId}`));
      });

});
