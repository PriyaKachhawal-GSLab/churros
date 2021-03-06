'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const folderPayload = require('./assets/folders.json');

suite.forElement('documents', 'folders', (test) => {
  let rootId = "%252F";
  let rootPath = "/";
  let random = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);

  it('should allow GET /folders/metadata for root folder', () => {
    let query = { path: rootPath };
    return cloud.withOptions({qs: query}).get("/hubs/documents/folders/metadata")
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.id).to.equal(rootId);
        expect(r.body.path).to.equal(rootPath);
        expect(r.body.directory).to.equal(true);
      });
  });

  it('should allow GET /folders/:id/metadata for root folder', () => {
    let folderId = rootId;
    return cloud.get(`/hubs/documents/folders/${folderId}/metadata`)
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.id).to.equal(rootId);
        expect(r.body.path).to.equal(rootPath);
        expect(r.body.directory).to.equal(true);
      });
  });

  const folderWrap = (cb) => {
    let folder;
    folderPayload.path += `-${random}`;
    folderPayload.name += `-${random}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder = r.body)
      .then(r => cb(folder))
      .then(r => cloud.delete(`/hubs/documents/folders/${folder.refId}`));
  };

  it('should allow CREATE /folders and DELETE /folders/:refId', () => {
    let folder;
    folderPayload.path += `-${random}`;
    folderPayload.name += `-${random}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder = r.body)
      .then(r => cloud.delete(`/hubs/documents/folders/${folder.refId}`));
  });



  it('should allow GET /folders/:refId/contents', () => {
    const cb = (folder) => {
      return cloud.get(`/hubs/documents/folders/${folder.refId}/contents`);
    };

    return folderWrap(cb);
  });

  it('should allow RU /folders/:refId/metadata', () => {
    const cb = (folder) => {
      let tempFolder = {
        path: `/a-${folder.name}`
      };
      return cloud.get(`/hubs/documents/folders/${folder.refId}/metadata`)
        .then(r => cloud.patch(`/hubs/documents/folders/${folder.refId}/metadata`, tempFolder));
    };

    return folderWrap(cb);
  });

  it('should allow POST /folders/:refId/copy', () => {

    const copy1 = { path: `/churrosCopy1-${random}` };

    const cb = (folder) => {
      let folderCopy;
      return cloud.post(`/hubs/documents/folders/${folder.refId}/copy?overwrite=true`, copy1)
        .then(r => folderCopy = r.body)
        .then(r => cloud.delete(`/hubs/documents/folders/${folderCopy.refId}`));
    };

    return folderWrap(cb);
  });

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);

  it('should allow GET /folders/contents', () => {
    return cloud.withOptions({ qs: { path: `/` } }).get(`${test.api}/contents`)
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.directory === true || obj.directory === false).length));
  });

  it('should return parentFolderId for GET /folders/content', ()=> {
    return cloud.withOptions({ qs: { path: `/` } }).get(`${test.api}/contents`)
        .then(r => expect(r.body.parentFolderId).to.not.equal(null));
  });
  
  it('should allow GET /folders/contents with directory', () => {
    return cloud.withOptions({ qs: { path: `/`, where: "directory='true'" } }).get(`${test.api}/contents`)
      .then(r => expect(r.body[0].directory).to.equal(true));
  });

});
