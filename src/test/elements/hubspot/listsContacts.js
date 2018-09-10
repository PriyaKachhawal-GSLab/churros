'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const contactsApi = '/hubs/marketing/contacts';
const payload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const createPayload = tools.requirePayload(`${__dirname}/assets/listsContacts-create.json`);
const propertyPayload = tools.requirePayload(`${__dirname}/assets/listsContactsContacts-create.json`);

suite.forElement('marketing', 'lists', null, (test) => {
  it(`should support CD for ${test.api} and ${contactsApi}, then CS ${test.api}/:listId/contacts`, () => {
    let listId, contactId, updatedPayload;
    return cloud.post(test.api, createPayload)
      .then(r => listId = r.body.id)
      .then(r => cloud.post(contactsApi, payload))
      .then(r => contactId = r.body.id)
      .then(r => propertyPayload[0].vid = contactId)
      .then(r => updatedPayload = propertyPayload)
      .then(r => cloud.post(`${test.api}/${listId}/contacts`, updatedPayload))
      .then(r => cloud.get(`${test.api}/${listId}/contacts`))
      //.then(r => cloud.delete(`${test.api}/${listId}/contacts/${contactId}`)) comment b/c error in hubspot ZH #4138
      .then(r => cloud.delete(`${test.api}/${listId}`))
      .then(r => cloud.delete(`${contactsApi}/${contactId}`));
  });
});
