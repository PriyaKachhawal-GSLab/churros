'use strict';

const suite = require('core/suite');
const payload = require('./assets/opportunities-create.json');
const updatePayload = require('./assets/opportunities-update.json');
const notesCreate = require('./assets/opportunitiesNotes-create.json');
const notesUpdate = require('./assets/opportunitiesNotes-update.json');
const cloud = require('core/cloud');

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.should.supportCruds();
  test.should.supportPagination();
  let opportunityId, noteId;
  it('should support CRUDS for opportunities/notes', () => {
    return cloud.post(test.api, payload)
      .then(r => opportunityId = r.body.id)
      .then(r => cloud.post(`${test.api}/${opportunityId}/notes`, notesCreate))
      .then(r => noteId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunityId}/notes/${noteId}`))
      .then(r => cloud.patch(`${test.api}/${opportunityId}/notes/${noteId}`, notesUpdate))
      .then(r => cloud.delete(`${test.api}/${opportunityId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${opportunityId}`));
  });
});
