'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/contacts-create.json');
const updatePayload = require('./assets/contacts-update.json');
const activityCreate = require('./assets/contactsActivities-create.json');
const noteCreate = require('./assets/contactsNotes-create.json');
const noteUpdate = require('./assets/contactsNotes-update.json');
const activitiesUpdate = require('./assets/contactsActivities-update.json');
const queryPayload = require('./assets/contactsActivitiesQueryTest.json');

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
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.withOptions({ qs: queryPayload }).post(`${test.api}/${contactId}/activities`, activityCreate))
      .then(r => activityId = r.body.id)
      .then(r => cloud.withOptions({ qs: queryPayload }).get(`${test.api}/${contactId}/activities/${activityId}`))
      .then(r => cloud.withOptions({ qs: queryPayload }).put(`${test.api}/${contactId}/activities/${activityId}`, activitiesUpdate))
      .then(r => cloud.withOptions({ qs: queryPayload }).delete(`${test.api}/${contactId}/activities/${activityId}`))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });
});
