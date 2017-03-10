'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/incidents');
const commentPayload = require('./assets/incidentComments');
const notifyPayload = require('./assets/notification');

suite.forElement('helpdesk', 'incidents', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');

  it('should allow CRUDS for /incidents/:id/comments', () => {
    let incidentId;
    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.cruds('/hubs/helpdesk/incidents/' + incidentId + '/comments', commentPayload))
      .then(r => cloud.delete('/hubs/helpdesk/incidents/' + incidentId));
  });

  it('should allow CS for /incidents/:id/attachments and RD for /attachments', () => {
    let query = { fileName: "testfile.txt" };
    let incidentId, attachmentId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.withOptions({ qs: query }).postFile(`hubs/helpdesk/incidents/${incidentId}/attachments`, __dirname + '/assets/attach.txt'))
      .then(r => cloud.get(`hubs/helpdesk/incidents/${incidentId}/attachments`))
      .then(r => attachmentId = r.body[0].id)
      .then(r => cloud.get(`/hubs/helpdesk/attachments/${attachmentId}`))
      .then(r => cloud.delete(`/hubs/helpdesk/attachments/${attachmentId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow SR for /incidents/:id/history', () => {
    let incidentId, historyId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.cd('/hubs/helpdesk/incidents/' + incidentId + '/comments', commentPayload))
      .then(r => cloud.get(`${test.api}/${incidentId}/history`))
      .then(r => historyId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${incidentId}/history/${historyId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow creating for /incidents/:id/notifications', () => {
    let incidentId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.post(`hubs/helpdesk/incidents/${incidentId}/notifications`, notifyPayload))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });
});
