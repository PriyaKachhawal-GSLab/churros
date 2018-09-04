'use strict';

const suite = require('core/suite');
const payload = require('./assets/campaigns-create.json');
const updatePayload = require('./assets/campaigns-update.json');
const createNote = require('./assets/campaignsNotes-create.json');
const updateNote = require('./assets/campaignsNotes-update.json');
const cloud = require('core/cloud');

suite.forElement('crm', 'campaigns', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  let campaignId, noteId;
  it('should support CRUDS for campaigns/notes', () => {
    return cloud.post(test.api, payload)
      .then(r => campaignId = r.body.id)
      .then(r => cloud.post(`${test.api}/${campaignId}/notes`, createNote))
      .then(r => noteId = r.body.id)
      .then(r => cloud.get(`${test.api}/${campaignId}/notes/${noteId}`))
      .then(r => cloud.patch(`${test.api}/${campaignId}/notes/${noteId}`, updateNote))
      .then(r => cloud.delete(`${test.api}/${campaignId}/notes/${noteId}`))
      .then(r => cloud.delete(`${test.api}/${campaignId}`));
  });
});
