'use strict';

const suite = require('core/suite');
const fs = require('fs');
const payload = require('./assets/incidents-create.json');
const updatePayload = require('./assets/incidents-update.json');
const notesCreate = require('./assets/incidentsNotes-create.json');
const notesUpdate = require('./assets/incidentsNotes-update.json');
const cloud = require('core/cloud');

suite.forElement('crm', 'incidents', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  let incidentId, noteId;
  it('should support CRUDS for incidents/notes', () => {
    return cloud.post(test.api, payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.post(`${test.api}/${incidentId}/notes`, notesCreate))
      .then(r => noteId = r.body.id)
      .then(r => cloud.get(`${test.api}/${incidentId}/notes/${noteId}`))
      .then(r => cloud.patch(`${test.api}/${incidentId}/notes/${noteId}`, notesUpdate))
      .then(r => cloud.delete(`${test.api}/${incidentId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should support GET and pagination for /hubs/crm/incindents/:incidentIdId/history', () => {
    return cloud.get(test.api)
      .then(r => incidentId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${incidentId}/history`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${incidentId}/history`));
  });

  let path = __dirname + '/assets/temp.jpg';
  const attachments = { formData: { file: fs.createReadStream(path) } };
  it('should support RUD for incidents/notes/attachments', () => {
    return cloud.post(test.api, payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.post(`${test.api}/${incidentId}/notes`, notesCreate))
      .then(r => noteId = r.body.id)
      .then(r => cloud.withOptions(attachments).put(`${test.api}/${incidentId}/notes/${noteId}/attachments`, undefined))
      .then(r => cloud.get(`${test.api}/${incidentId}/notes/${noteId}/attachments`))
      .then(r => cloud.delete(`${test.api}/${incidentId}/notes/${noteId}/attachments`))
      .then(r => cloud.delete(`${test.api}/${incidentId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });
});
