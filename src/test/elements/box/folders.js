'use strict';

const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const suite = require('core/suite');
const folderPayload = require('./assets/folders');
const folderTags = require('./assets/folderTags');

const randomInt = tools.randomInt();
folderPayload.path += randomInt;
folderPayload.name += randomInt;

suite.forElement('documents', 'folders', {}, (test) => {
  let folderTagPayload, folderUpdateTagPayload;
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

  it('should allow CD /folders', () => {
    let folder1;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder1 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'));
  });

  before(() => cloud.post(test.api, folderTags)
      .then(r => {
        expect(r).to.have.statusCode(200);
        folderTagPayload = r.body;
        folderTagPayload.tags = ["folderTag1","folderTag2"];
      }));

  after(() => cloud.delete(`${test.api}/${folderTagPayload.id}`));

  it('should allow UR tags /folders/metadata', () => {
    return cloud.withOptions({ qs: { path: folderTagPayload.path } }).patch(`${test.api}/metadata`, folderTagPayload)
    .then(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.tags[0]).to.equal(`${folderTagPayload.tags[0]}`);
      folderUpdateTagPayload = r.body;
      folderUpdateTagPayload.tags = ["folderTag1Updated","folderTag2Updated"];
    })
    .then(() => cloud.withOptions({ qs: { path: folderTagPayload.path } }).get(`${test.api}/metadata`))
    .then(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.tags[0]).to.equal(`${folderTagPayload.tags[0]}`);
    });
  });

  it('should allow UR tags PATCH /folders/:id/metadata', () => {
    return cloud.patch(`${test.api}/${folderUpdateTagPayload.id}/metadata`, folderUpdateTagPayload)
    .then(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.tags[0]).to.equal(`${folderUpdateTagPayload.tags[0]}`);
    })
    .then(() => cloud.get(`${test.api}/${folderUpdateTagPayload.id}/metadata`))
    .then(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body.tags[0]).to.equal(`${folderUpdateTagPayload.tags[0]}`);
    });
  });

});
