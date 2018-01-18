'use strict';

const cloud = require('core/cloud');
const tools = require('core/tools');
const suite = require('core/suite');
const folderPayload = require('./assets/folders');

const randomInt = tools.randomInt();
folderPayload.path += randomInt;
folderPayload.name += randomInt;

suite.forElement('documents', 'folders', { payload: folderPayload }, (test) => {
  it(`should allow CD for ${test.api} and GET links`, () => {
    let folderId;
    return cloud.post(test.api, folderPayload)
      .then(r => folderId = r.body.id)
      .then(r => cloud.get(`${test.api}/${folderId}/links`))
      .then(() => cloud.delete(`${test.api}/${folderId}`));
  });
});
