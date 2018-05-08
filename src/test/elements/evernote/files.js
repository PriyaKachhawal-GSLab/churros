'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const foldersPayload = require('./assets/folders');

suite.forElement('documents', 'files', (test) => {
  let UploadFile = __dirname + '/assets/Penguins.jpg',
    fileId, srcPath, folderPath, filesPayload;

  it(`should allow CRUD for ${test.api}/content and ${test.api}/metadata by path`, () => {
    foldersPayload.path = `/folder` + tools.randomInt();
    return cloud.post('/hubs/documents/folders', foldersPayload)
      .then(r => folderPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${folderPath}/Penguins.jpg`, overwrite: 'true', size: '777835' } }).postFile(test.api, UploadFile))
      .then(r => {
        srcPath = r.body.path;
        filesPayload = { "path": srcPath };
      })
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).post(`${test.api}/copy`, filesPayload))
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).get(`${test.api}/links`))
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).patch(`${test.api}/metadata`, filesPayload))
      .then(r => cloud.withOptions({ qs: { path: srcPath } }).delete(`${test.api}`));
  });
  it(`should allow CRUD for ${test.api}/content and ${test.api}/metadata by id`, () => {
    return cloud.withOptions({ qs: { path: `${folderPath}/Penguins.jpg`, overwrite: 'true', size: '777835' } }).postFile(test.api, UploadFile)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.post(`${test.api}/${fileId}/copy`, filesPayload))
      .then(r => cloud.get(`${test.api}/${fileId}/links`))
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, filesPayload))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });

  it('should allow RS for documents/files/:id/revisions', () => {
    const fileId = 'd59f5f2f-0137-4393-9469-e72f1443cd9f';
    let revisionId;
    return cloud.get(`${test.api}/${fileId}/revisions`)
      .then(r => {
        expect(r.body[0]).to.contain.key('id');
        revisionId = r.body[0].id;
      })
      .then(() => cloud.get(`${test.api}/${fileId}/revisions/${revisionId}`));
  });

  it('should allow RS for documents/files/revisions by path', () => {
    let options = { qs: { path: '/Dont_Delete_Churros_Test_NoteBook/d59f5f2f-0137-4393-9469-e72f1443cd9f' } };
    let revisionId;
    return cloud.withOptions(options).get(`${test.api}/revisions`)
      .then(r => {
        expect(r.body[0]).to.contain.key('id');
        revisionId = r.body[0].id;
      })
      .then(() => cloud.withOptions(options).get(`${test.api}/revisions/${revisionId}`));
  });
});
