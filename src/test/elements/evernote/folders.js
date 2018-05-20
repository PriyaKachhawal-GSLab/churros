'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = require('./assets/folders');
const build = (overrides) => Object.assign({}, payload, overrides);
const foldersPayload = build({ path: `/folder` + tools.randomInt() });

suite.forElement('documents', 'folders', { payload: foldersPayload }, (test) => {
  let srcPath, folderId;

  it(`should allow CRU for ${test.api}/contents and ${test.api}/metadata by path`, () => {
    return cloud.post(test.api, foldersPayload)
      .then(r => {
        srcPath = r.body.path;
        folderId = r.body.id;
      })
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}`, page: 1, pageSize: 1 } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).patch(`${test.api}/metadata`, foldersPayload));
  });
  
  it(`should allow CRU for ${test.api}/contents and ${test.api}/metadata by id`, () => {
    return cloud.get(`${test.api}/${folderId}/contents`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${folderId}/contents`))
      .then(r => cloud.get(`${test.api}/${folderId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${folderId}/metadata`, foldersPayload));
  });

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);
});
