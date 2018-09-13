'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const activityPayload = tools.requirePayload(`${__dirname}/assets/contactsActivities-create.json`);
const activityUpdatePayload = tools.requirePayload(`${__dirname}/assets/contactsActivities-update.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const contactsUpdatePayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const taskPayload = tools.requirePayload(`${__dirname}/assets/contactsTasks-create.json`);
const taskUpdatePayload = tools.requirePayload(`${__dirname}/assets/contactsTasks-update.json`);
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'contacts', { payload: contactsPayload }, (test) => {
  it('should allow ping for sfdcservicecloud', () => {
    return cloud.get(`/hubs/helpdesk/ping`);
  });

  test.should.supportPagination();
  it('should allow CRUDS /hubs/helpdesk/contacts ', () => {
    let contactId;
    return cloud.post(test.api, contactsPayload)
      .then(r => contactId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${contactId}`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${contactId}'` } }).get(test.api))
      .then(r => cloud.patch(`${test.api}/${contactId}`, contactsUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });

  it('should allow CRUDS /hubs/helpdesk/contacts/:id/activites ', () => {
    let contactId, activityId;
    return cloud.post(test.api, contactsPayload)
      .then(r => contactId = r.body.Id)
      .then(r => cloud.post(`${test.api}/${contactId}/activities`, activityPayload))
      .then(r => activityId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${contactId}/activities/${activityId}`))
      .then(r => cloud.get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.withOptions({ qs: { where: `id='${activityId}'` } }).get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.patch(`${test.api}/${contactId}/activities/${activityId}`, activityUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${contactId}/activities/${activityId}`))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });

  it('should allow CRUDS /hubs/helpdesk/contacts/:id/tasks ', () => {
    let contactId, taskId;
    return cloud.post(test.api, contactsPayload)
      .then(r => contactId = r.body.Id)
      .then(r => cloud.post(`${test.api}/${contactId}/tasks`, taskPayload))
      .then(r => taskId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${contactId}/tasks/${taskId}`))
      .then(r => cloud.get(`${test.api}/${contactId}/tasks`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${contactId}/tasks`))
      .then(r => cloud.withOptions({ qs: { where: `id='${taskId}'` } }).get(`${test.api}/${contactId}/tasks`))
      .then(r => cloud.patch(`${test.api}/${contactId}/tasks/${taskId}`, taskUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${contactId}/tasks/${taskId}`))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });
});
