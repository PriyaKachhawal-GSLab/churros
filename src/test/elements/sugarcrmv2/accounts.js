'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/accounts-update.json`);
const activityCreate = require('./assets/accountsActivities-create.json');
const activityUpdate = require('./assets/accountsActivities-update.json');
const noteCreate = tools.requirePayload(`${__dirname}/assets/accountsNotes-create.json`);
const noteUpdate = tools.requirePayload(`${__dirname}/assets/accountsNotes-update.json`);
const queryTypePayload = tools.requirePayload(`${__dirname}/assets/accountsActivities-QueryTest.json`);

const cloud = require('core/cloud');
suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  let accountId;
  let noteId;
  it('should support CRUDS for accounts/notes', () => {
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.post(`${test.api}/${accountId}/notes`, noteCreate))
      .then(r => noteId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}/notes/${noteId}`))
      .then(r => cloud.patch(`${test.api}/${accountId}/notes/${noteId}`, noteUpdate))
      .then(r => cloud.delete(`${test.api}/${accountId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });

  let activityId;
  it('should support CRUDS and pagination for accounts/activities', () => {
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${accountId}/activities`))
      .then(r => cloud.withOptions({ qs: queryTypePayload }).post(`${test.api}/${accountId}/activities`, activityCreate))
      .then(r => activityId = r.body.id)
      .then(r => cloud.withOptions({ qs: queryTypePayload }).get(`${test.api}/${accountId}/activities/${activityId}`))
      .then(r => cloud.withOptions({ qs: queryTypePayload }).put(`${test.api}/${accountId}/activities/${activityId}`, activityUpdate))
      .then(r => cloud.withOptions({ qs: queryTypePayload }).delete(`${test.api}/${accountId}/activities/${activityId}`))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});
