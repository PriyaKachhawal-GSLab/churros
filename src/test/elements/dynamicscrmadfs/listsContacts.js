'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = chakram.expect;

const listPayload = tools.requirePayload(`${__dirname}/assets/lists-create.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);

suite.forElement('crm', 'lists/{id}/contacts', { payload: listPayload }, (test) => {

  it('Test for /list/{id}/contacts', () => {
      var listId = null;
      var contactId = null;
      return cloud.post(test.api, listPayload)
        .then(r => listId = r.body.id)
        .then(r => cloud.post(`/contacts`,contactPayload))
        .then(r => contactId = r.body.id)
        .then(() => cloud.patch(`/lists/${listId}/contacts/${contactId}`))
        .then(() => cloud.withOptions({ qs: { where: `entityid='${contactId}'`}}).get(`/lists/${listId}/contacts`, (r) => {
          expect(r.body).to.have.lengthOf(1);
        }))
        .then(r => cloud.delete(`/lists/${listId}/contacts/${contactId}`))
        .then(() => cloud.withOptions({ qs: { where: `entityid='${contactId}'`}}).get(`/lists/${listId}/contacts`, (r) => {
          expect(r.body).to.have.lengthOf(0);
        }))
        .then(r => cloud.delete(`/lists/${listId}`))
        .then(r => cloud.delete(`/contacts/${contactId}`));
      });

});
