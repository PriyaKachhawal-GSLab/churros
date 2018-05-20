'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/folders.json`);

suite.forElement('documents', 'folders', { payload: payload }, (test) => {

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);
  
  it('should allow CRD for hubs/documents/folders and GET for hubs/documents/folders/metadata by path', () => {
    let srcPath;
    return cloud.post(test.api, payload)
      .then(r => {
        srcPath = r.body.path;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}`, page: 1, pageSize: 1 } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).delete(test.api));
  });

  it('should allow CRD for hubs/documents/folders and GET for hubs/documents/folders/metadata by id', () => {
    let folderId;
    return cloud.post(test.api, payload)
      .then(r => {
        folderId = r.body.id;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cloud.get(`${test.api}/${folderId}/contents`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${folderId}/contents`))
      .then(r => cloud.get(`${test.api}/${folderId}/metadata`))
      .then(r => cloud.delete(`${test.api}/${folderId}`));
  });
});
