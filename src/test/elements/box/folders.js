'use strict';

const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const suite = require('core/suite');
const folderPayload = require('./assets/folders');

const randomInt = tools.randomInt();
folderPayload.path += randomInt;
folderPayload.name += randomInt;

suite.forElement('documents', 'folders', {}, (test) => {
  it(`should allow CD for ${test.api} and GET collaborations`, () => {
    let folderId;
    return cloud.post(test.api, folderPayload)
      .then(r => folderId = r.body.id)
      .then(r => cloud.get(`${test.api}/${folderId}/collaborations`))
      .then(() => cloud.delete(`${test.api}/${folderId}`));
  });

  it('should include bookmarks in GET /folders/contents results', () => {
    return cloud.withOptions({qs: { path: "/TestFolderDoNoDelete"}}).get(`${test.api}/contents?raw=true`)
    .then(r => {
      let bookmark = r.body.filter(item => item.name === 'SampleBookMark')[0];
      expect(bookmark.raw.type).to.equal('web_link');
    });
  });
});
