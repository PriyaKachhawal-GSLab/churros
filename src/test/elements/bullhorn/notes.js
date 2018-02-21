'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const notesPayload = require('./assets/notes');

const updatePayload = {
  "comments": "Comment on updated note"
};

suite.forElement('crm', 'notes', { payload: notesPayload }, (test) => {
  const build = (overrides) => Object.assign({}, notesPayload, overrides);
  const payload = build({ comments: tools.random() });
  it('should create a note and then update', () => {
    let noteId;
    return cloud.post(test.api, payload)
      .then(r => noteId = r.body.changedEntityId)
      .then(r => cloud.get(`${test.api}/${noteId}`))
      .then(r => cloud.withOptions({ qs: { fields: 'comments,personReference.id' } })
        .get(`${test.api}/${noteId}`)
        .then(r => {
          expect(r.body).to.contain.key('comments');
          expect(r.body).to.contain.key('personReference');
          expect(r.body.personReference).to.contain.key('id');
        }))
      .then(r => cloud.patch(`${test.api}/${noteId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${noteId}`));
  });
});
