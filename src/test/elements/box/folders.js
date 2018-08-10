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
  let folder, folderUpdate;

  before(() => cloud.post(test.api, folderTags)
    .then(r => {
      expect(r).to.have.statusCode(200);
      folder = r.body;
      folder.tags = ["folderTag1", "folderTag2"];
    }));

  after(() => cloud.delete(`${test.api}/${folder.id}`));

  afterEach(done => {
    //We were getting a 429 before this
    setTimeout(done, 4000);
  });

  it('should allow CD /folders and DELETE /folders/:id', () => {
    let folder1, folder2;
    let random1 = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;
    folderPayload.path += `-${random1}`;
    folderPayload.name += `-${random1}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder1 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'))
      .then(() => cloud.post('/hubs/documents/folders', folderPayload))
      .then(r => folder2 = r.body)
      .then(r => cloud.delete(`/hubs/documents/folders/${folder2.id}`));
  });

  it('should allow GET /folders/contents and GET /folders/:id/contents', () => {
    return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/contents')
      .then(r => cloud.get(`/hubs/documents/folders/${folder.id}/contents`));
  });

  it('should allow for GET /folders/:id/links', () => {
    return cloud.get(`${test.api}/${folder.id}/links`);
  }); 

  it('should allow for GET /folders/links by path', () => {
    return cloud.withOptions({ qs: { path: folder.path } }).get(`${test.api}/links`);
  }); 

  it('should allow RU /folders/metadata and RU /folders/:id/metadata', () => {
    let updatedFolder,
      folderTemp = {
        path: `/a-${folder.name}`,
        description: "churros description"
      };
      folder.description = "churros update by id";
    return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
      .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp))
      .then(r => updatedFolder = r.body)
      .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
      .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));
  });

  it('should allow POST /folders/copy and POST /folders/:id/copy', () => {
    const copy1 = { path: `/churrosCopy1${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };
    const copy2 = { path: `/churrosCopy2${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };
    let folderCopy1, folderCopy2;
    return cloud.withOptions({ qs: { path: folder.path } }).post('/hubs/documents/folders/copy', copy1)
      .then(r => folderCopy1 = r.body)
      .then(() => cloud.post(`/hubs/documents/folders/${folder.id}/copy`, copy2))
      .then(r => folderCopy2 = r.body)
      .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy1.id}`))
      .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy2.id}`));
  });
  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);
  
  it(`should allow GET /folders/:id/collaborations`, () => {
    let folderId;
    return cloud.post(test.api, folderPayload)
      .then(r => folderId = r.body.id)
      .then(r => cloud.get(`${test.api}/${folderId}/collaborations`))
      .then(() => cloud.delete(`${test.api}/${folderId}`));
  });

  it('should include bookmarks in GET /folders/contents results', () => {
    return cloud.withOptions({ qs: { path: "/TestFolderDoNotDelete" } }).get(`${test.api}/contents?raw=true`)
      .then(r => {
        let bookmark = r.body.filter(item => item.name === 'SampleBookMark')[0];
        expect(bookmark.raw.type).to.equal('web_link');
      });
  });

  it('should allow UR tags /folders/metadata by path', () => {
    return cloud.withOptions({ qs: { path: folder.path } }).patch(`${test.api}/metadata`, folder)
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${folder.tags[0]}`);
        folderUpdate = r.body;
        folderUpdate.tags = ["folderTag1Updated", "folderTag2Updated"];
      })
      .then(() => cloud.withOptions({ qs: { path: folder.path } }).get(`${test.api}/metadata`))
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${folder.tags[0]}`);
      });
  });

  it('should allow UR tags /folders/:id/metadata', () => {
    return cloud.patch(`${test.api}/${folderUpdate.id}/metadata`, folderUpdate)
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${folderUpdate.tags[0]}`);
      })
      .then(() => cloud.get(`${test.api}/${folderUpdate.id}/metadata`))
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${folderUpdate.tags[0]}`);
      });
  });

});
