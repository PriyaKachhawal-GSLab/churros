'use strict';

const suite = require('core/suite');
const payload = require('./assets/contacts-create.json');
const updatePayload = require('./assets/contacts-update.json');
const cloud = require('core/cloud');
const activityCreate = require('./assets/contactsActivities-create.json');
const noteCreate = require('./assets/contactsNotes-create.json');
const noteUpdate = require('./assets/contactsNotes-update.json');
const activitiesUpdate = require('./assets/contactsActivities-update.json');
const pagination = require('./assets/contactsActivities-queryPaginationTest.json');
const calling = require('./assets/contactsActivities-queryTypeTest.json');

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  let contactId, noteId;
  it('should support CRUDS for contacts/notes', () => {
    return cloud.post(test.api, payload)
      .then(r => contactId = r.body.id)
      .then(r => cloud.post(`${test.api}/${contactId}/notes`, noteCreate))
      .then(r => noteId = r.body.id)
      .then(r => cloud.get(`${test.api}/${contactId}/notes/${noteId}`))
      .then(r => cloud.patch(`${test.api}/${contactId}/notes/${noteId}`, noteUpdate))
      .then(r => cloud.delete(`${test.api}/${contactId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });

  let activityId;
  it('should support CRUDS and pagination for contact/activities', () => {
    return cloud.post(test.api, payload)
      .then(r => contactId = r.body.id)
      .then(r => cloud.withOptions({ qs: pagination }).get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.withOptions({ qs: calling }).post(`${test.api}/${contactId}/activities`, activityCreate))
      .then(r => activityId = r.body.id)
      .then(r => cloud.withOptions({ qs: calling }).get(`${test.api}/${contactId}/activities/${activityId}`))
      .then(r => cloud.withOptions({ qs: calling }).put(`${test.api}/${contactId}/activities/${activityId}`, activitiesUpdate))
      .then(r => cloud.withOptions({ qs: calling }).delete(`${test.api}/${contactId}/activities/${activityId}`))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });
});
