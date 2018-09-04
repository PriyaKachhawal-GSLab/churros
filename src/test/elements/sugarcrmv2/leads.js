'use strict';

const suite = require('core/suite');
const payload = require('./assets/leads-create.json');
const updatePayload = require('./assets/leads-update.json');
const noteCreate = require('./assets/leadsNotes-create.json');
const noteUpdate = require('./assets/leadsNotes-update.json');
const cloud = require('core/cloud');

suite.forElement('crm', 'leads', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.should.supportCruds();
  test.should.supportPagination();
  let leadId, noteId;
  it('should support CRUDS for leads/notes', () => {
    return cloud.post(test.api, payload)
      .then(r => leadId = r.body.id)
      .then(r => cloud.post(`${test.api}/${leadId}/notes`, noteCreate))
      .then(r => noteId = r.body.id)
      .then(r => cloud.get(`${test.api}/${leadId}/notes/${noteId}`))
      .then(r => cloud.patch(`${test.api}/${leadId}/notes/${noteId}`, noteUpdate))
      .then(r => cloud.delete(`${test.api}/${leadId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${leadId}`));
  });
});
