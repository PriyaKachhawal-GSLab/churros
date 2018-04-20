'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const folderPayload = require('./assets/folders');
const specialCharsFolderPayload = require('./assets/folders-special-chars');
const faker = require('faker');

suite.forElement('documents', 'folders', (test) => {
  let random = `${tools.random()}`;
  folderPayload.path += `-${random}`;
  folderPayload.name += `-${random}`;

  const folderWrap = (cb) => {
    let folder;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder = r.body)
      .then(r => cb(folder))
      .then(r => cloud.withOptions({ qs: { path: folder.path } }).delete('/hubs/documents/folders'));
  };

  it('should allow CD /folders', () => {
    let folder1;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder1 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'));
  });

  it('should allow C /folders and DELETE /folders/:id', () => {
    let folder2;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder2 = r.body)
      .then(r => cloud.delete(`/hubs/documents/folders/${folder2.id}`));
  });


  it('should allow GET /folders/contents and GET /folders/:id/contents', () => {
    const cb = (folder) => {
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/contents')
        .then(r => cloud.get(`/hubs/documents/folders/${folder.id}/contents`));
    };

    return folderWrap(cb);
  });

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);

  it('should allow RU /folders/metadata and RU /folders/:id/metadata', () => {
    const cb = (folder) => {
      let updatedFolder;
      let folderTemp = {
        path: folder.path + "22tt"
      };
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
        .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp))
        .then(r => updatedFolder = r.body)
        .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
        .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));

    };
    return folderWrap(cb);
  });

  it('should allow POST /folders/copy and POST /folders/:id/copy', () => {

    const copy1 = { path: `/churrosCopy1${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };
    const copy2 = { path: `/churrosCopy2${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };

    const cb = (folder) => {
      let folderCopy1, folderCopy2;
      return cloud.withOptions({ qs: { path: folder.path } }).post('/hubs/documents/folders/copy', copy1)
        .then(r => folderCopy1 = r.body)
        .then(() => cloud.post(`/hubs/documents/folders/${folder.id}/copy`, copy2))
        .then(r => folderCopy2 = r.body)
        .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy1.id}`))
        .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy2.id}`));
    };

    return folderWrap(cb);
  });

  it('should allow CD /folders with special characters', () => {
    let folder1;
    let randoText = 'åbc≈¥Ω' + faker.random.uuid();
    specialCharsFolderPayload.name += randoText;
    specialCharsFolderPayload.path += randoText;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder1 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'));
  });

});
