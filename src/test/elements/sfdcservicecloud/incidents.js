'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const incidentsPayload = tools.requirePayload(`${__dirname}/assets/incidents-create.json`);
const incidentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/incidents-update.json`);
const activityPayload = tools.requirePayload(`${__dirname}/assets/incidentsActivities-create.json`);
const activityUpdatePayload = tools.requirePayload(`${__dirname}/assets/incidentsActivities-update.json`);
const taskPayload = tools.requirePayload(`${__dirname}/assets/incidentsTasks-create.json`);
const taskUpdatePayload = tools.requirePayload(`${__dirname}/assets/incidentsTasks-update.json`);
const cloud = require('core/cloud');

suite.forElement('helpdesk', 'incidents', { payload: incidentsPayload }, (test) => {
  it('should allow CRUDS /hubs/helpdesk/incidents ', () => {
    let incidentId;
    return cloud.post(test.api, incidentsPayload)
      .then(r => incidentId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${incidentId}`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `id='${incidentId}'` } }).get(test.api))
      .then(r => cloud.patch(`${test.api}/${incidentId}`, incidentsUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow CRUDS /hubs/helpdesk/incidents/:id/activites ', () => {
    let incidentId, activityId;
    return cloud.post(test.api, incidentsPayload)
      .then(r => incidentId = r.body.Id)
      .then(r => cloud.post(`${test.api}/${incidentId}/activities`, activityPayload))
      .then(r => activityId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${incidentId}/activities/${activityId}`))
      .then(r => cloud.get(`${test.api}/${incidentId}/activities`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${incidentId}/activities`))
      .then(r => cloud.withOptions({ qs: { where: `id='${activityId}'` } }).get(`${test.api}/${incidentId}/activities`))
      .then(r => cloud.patch(`${test.api}/${incidentId}/activities/${activityId}`, activityUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${incidentId}/activities/${activityId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow CRUDS /hubs/helpdesk/incidents/:id/tasks ', () => {
    let incidentId, taskId;
    return cloud.post(test.api, incidentsPayload)
      .then(r => incidentId = r.body.Id)
      .then(r => cloud.post(`${test.api}/${incidentId}/tasks`, taskPayload))
      .then(r => taskId = r.body.Id)
      .then(r => cloud.get(`${test.api}/${incidentId}/tasks/${taskId}`))
      .then(r => cloud.get(`${test.api}/${incidentId}/tasks`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${incidentId}/tasks`))
      .then(r => cloud.withOptions({ qs: { where: `id='${taskId}'` } }).get(`${test.api}/${incidentId}/tasks`))
      .then(r => cloud.patch(`${test.api}/${incidentId}/tasks/${taskId}`, taskUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${incidentId}/tasks/${taskId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });
});
