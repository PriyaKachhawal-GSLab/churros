'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/files.json`);

suite.forElement('documents', 'files', { payload: payload }, (test) => {
  it('should allow ping for sharepoint', () => {
    return cloud.get(`/hubs/documents/ping`);
  });

  it('should allow CRD for hubs/documents/files and RU for hubs/documents/files/metadata by path', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      srcPath;
    return cloud.withOptions({ qs: { path: `/${tools.random()}`, overwrite: 'true', size: '777835' } }).postFile(test.api, UploadFile)
      .then(r => {
        srcPath = r.body.path;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).post(`${test.api}/copy`, payload))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/links`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).patch(`${test.api}/metadata`, payload))
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).delete(test.api));
  });

  it('should allow CRD for hubs/documents/files and RU for hubs/documents/files/metadata by id', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      fileId;
    return cloud.withOptions({ qs: { path: `/${tools.random()}`, overwrite: 'true', size: '777835' } }).postFile(test.api, UploadFile)
      .then(r => {
        fileId = r.body.id;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.post(`${test.api}/${fileId}/copy`, payload))
      .then(r => cloud.get(`${test.api}/${fileId}/links`))
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, payload))
      .then(r => fileId = r.body.id)
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });
});
