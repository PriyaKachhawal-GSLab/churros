'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = chakram.expect;

const listPayload = tools.requirePayload(`${__dirname}/assets/listsLeads-create.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);

suite.forElement('crm', 'lists/{id}/leads', { payload: listPayload }, (test) => {

  it('Test for /list/{id}/leads', () => {
      var listId = null;
      var leadId = null;
      return cloud.post(test.api, listPayload)
        .then(r => listId = r.body.id)
        .then(r => cloud.post(`/leads`,contactPayload))
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
