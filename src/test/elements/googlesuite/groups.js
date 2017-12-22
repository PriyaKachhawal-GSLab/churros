'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/groups.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);

suite.forElement('general', 'groups', { payload: payload }, (test) => {

  let contactId;
  const groupContactsPayload={
	            "resourceNamesToAdd":[
		     ]};
  before(() => cloud.post('/hubs/general/contacts', contactPayload)
	.then(r => contactId = r.body.id)
	.then(r => groupContactsPayload.resourceNamesToAdd.push(contactId)));
 

  let groupId;
  it('should test CRUDS of  groups', () => {
  return cloud.get(test.api)
   .then(r => cloud.post(test.api, payload))
   .then(r => {
	       groupId=r.body.id;
	       payload.etag=r.body.etag;
              })
   .then(r => cloud.get(`${test.api}/${groupId}`))
   .then(r => cloud.patch(`${test.api}/${groupId}`, payload))
   .then(r => cloud.patch(`${test.api}/${groupId}/contacts`, groupContactsPayload))
   .then(r => cloud.post(`${test.api}/${groupId}/contacts/${contactId}`, null))
   .then(r => cloud.delete(`${test.api}/${groupId}/contacts/${contactId}`, null))
   .then(r => cloud.delete(`${test.api}/${groupId}`));
  });
 
  after(() => cloud.delete(`/hubs/general/contacts/${contactId}`));

  test.should.supportNextPagePagination(1);
});
