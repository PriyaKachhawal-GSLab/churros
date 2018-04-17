'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const faker = require('faker');
const payload = require('./assets/folders');

payload.path = payload.path + `-${faker.random.number()}`;

//Need to skip as there is no delete API
suite.forElement('documents', 'folders', { payload: payload, skip: true}, (test) => {
  let srcPath, folderId;

  it('should allow C for hubs/documents/folders and SR for hubs/documents/folders/metadata and hubs/documents/folders/content by path', () => {
    return cloud.post(`${test.api}`, payload)
      .then(r => {
        srcPath = r.body.path;
        folderId = r.body.id;
      })
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}`, page: 1, pageSize: 1 } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/${folderId}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/${folderId}/metadata`));
  });

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);
});
