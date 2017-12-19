'use strict';

const suite = require('core/suite');
const payload = require('./assets/programs');
const tools = require('core/tools');
const cloud = require('core/cloud');

const updatePayload = {
  "name": "Name for Program Test" + tools.random(),
  "channel": "Email Send",
  "type": "Email",
  "folder": {
    "type":"Folder",
    "id":33
  }
};

suite.forElement('marketing', 'programs', { payload: payload }, (test) => {
  payload.name += tools.random();
  let id;
  it('should allow CRUD for /programs', () => {
    return cloud.post(test.api, payload)
    .then(r => id = r.body[0].id)
    .then(r => cloud.get(`${test.api}/${id}`))
    .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
    .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
