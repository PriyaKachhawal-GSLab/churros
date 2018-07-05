'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/files.json`);

suite.forElement('documents', 'files', { payload: payload }, (test) => {
  let jpgFile = __dirname + '/assets/Penguins.jpg';
  var jpgFileBody,revisionId;
  let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` , overwrite: 'true', size: '777835'};

  before(() => cloud.withOptions({ qs : query }).postFile(test.api, jpgFile)
  .then(() => cloud.withOptions({ qs : query }).postFile(test.api, jpgFile))
  .then(r => jpgFileBody = r.body));

  after(() => cloud.delete(`${test.api}/${jpgFileBody.id}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
      return cloud.get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: query }).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: query }).get(`${test.api}/revisions/${revisionId}`));
  });
  
  it('should allow ping for sharepoint', () => {
    return cloud.get(`/hubs/documents/ping`);
  });

  it('should allow CRD for hubs/documents/files and RU for hubs/documents/files/metadata by path', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      srcPath;
    return cloud.withOptions({ qs: { path: `/${tools.random()}`, overwrite: 'true', size: '777835' }, headers: { "Subsite": "/RobotSite" } }).postFile(test.api, UploadFile)
      .then(r => {
        srcPath = r.body.path;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` }, headers: { "Subsite": "/RobotSite" } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` }, headers: { "Subsite": "/RobotSite" } }).post(`${test.api}/copy`, payload))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` }, headers: { "Subsite": "/RobotSite" } }).get(`${test.api}/links`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` }, headers: { "Subsite": "/RobotSite" } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` }, headers: { "Subsite": "/RobotSite" } }).patch(`${test.api}/metadata`, payload))
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` }, headers: { "Subsite": "/RobotSite" } }).delete(test.api));
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
