'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const contactPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const listContactPayload = tools.requirePayload(`${__dirname}/assets/lists-create.json`);

suite.forElement('marketing', 'lists', null, (test) => {
  it('should allow SR for /lists and CRDS for /contacts', () => {
    let id, contactId, objectName;
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.post(`/hubs/marketing/contacts`, contactPayload))
      .then(r => contactId = r.body.person.id)
      .then(r => listContactPayload[0].person.id = contactId)
      .then(r => cloud.post(`${test.api}/${id}/contacts`, listContactPayload))
      .then(r => cloud.get(`${test.api}/${id}/contacts/${contactId}`))
      .then(r => cloud.get(`${test.api}/${id}/leads/${contactId}/isMember`))
      .then(r => cloud.delete(`${test.api}/${id}/contacts/${contactId}`))
      .then(r => objectName = 'contacts')
      .then(r => cloud.get(`${test.api}/${id}/${objectName}`))
      .then(r => cloud.delete(`/hubs/marketing/contacts/${contactId}`));
  });
});
