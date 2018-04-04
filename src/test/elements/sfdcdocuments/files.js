'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const upload = require('./assets/metadata');
const commentPayload = tools.requirePayload(`${__dirname}/assets/comment.json`);



suite.forElement('documents', 'files', null, (test) => {
  let jpgFileBody,revisionId,revisionFileId,revisionFilePath,jpgFile = __dirname + '/assets/Penguins.jpg';
  let query = { path: `/Penguins-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };

  before(() => cloud.withOptions({ qs: query , overwrite: true }).postFile(test.api, jpgFile)
  .then(r => jpgFileBody = r.body));

  after(() => cloud.delete(`${test.api}/${jpgFileBody.id}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
          return cloud.get(`${test.api}/${jpgFileBody.id}/revisions`)
          .then(r => {
            revisionId = r.body[0].id;
            revisionFileId = r.body[0].fileId;
            revisionFilePath = r.body[0].filePath;
          })
          .then(() => cloud.get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
      });

      it('it should allow RS for documents/files/revisions by path', () => {
          return cloud.withOptions({ qs: {path : `${jpgFileBody.path}`} }).get(`${test.api}/revisions`)
          .then(() => cloud.withOptions({ qs: {path : `${jpgFileBody.path}`} }).get(`${test.api}/revisions/${revisionId}`));
      });

  it('should allow ping for sfdcdocuments', () => {
    return cloud.get(`/hubs/documents/ping`);
  });

  it('should allow CRD for hubs/documents/files and UR for hubs/documents/files/metadata by path', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      srcPath;
    return cloud.withOptions({ qs: { path: `/${tools.random()}.jpg` } }).postFile(test.api, UploadFile)
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(test.api))
      .then(r => expect(r.response.headers['content-type']).to.contain('image/jpeg'))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).patch(`${test.api}/metadata`, upload))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).delete(test.api));
  });

  it('should allow CRD for hubs/documents/files and UR for hubs/documents/files/metadata by id', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      fileId;
    return cloud.withOptions({ qs: { path: `/${tools.random()}.jpg` } }).postFile(test.api, UploadFile)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => expect(r.response.headers['content-type']).to.contain('image/jpeg'))
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, upload))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });
  it('should allow CRD for hubs/documents/files and UR for hubs/documents/files/metadata by id', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      fileId;
    return cloud.withOptions({ qs: { path: `/${tools.random()}` } }).postFile(test.api, UploadFile)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, upload))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });



  it(`should allow CRDS for ${test.api}/:id/comments`, () => cloud.crds(`${test.api}/${jpgFileBody.feedId}/comments`, commentPayload));


  it(`should allow paginating for ${test.api}/:id/comments`, () => {
    let commentId1, commentId2, nextPage;
    return cloud.post(`${test.api}/${jpgFileBody.feedId}/comments`, commentPayload)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.post(`${test.api}/${jpgFileBody.feedId}/comments`, commentPayload))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jpgFileBody.feedId}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId2);
        expect(r.response.headers['elements-next-page-token']).to.exist;
        nextPage = r.response.headers['elements-next-page-token'];
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, nextPage } }).get(`${test.api}/${jpgFileBody.feedId}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId1);
        expect(r.response.headers['elements-next-page-token']).to.not.exist;
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jpgFileBody.feedId}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 2 } }).get(`${test.api}/${jpgFileBody.feedId}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(2) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.delete(`${test.api}/${jpgFileBody.feedId}/comments/${commentId1}`))
      .then(r => cloud.delete(`${test.api}/${jpgFileBody.feedId}/comments/${commentId2}`));
  });

  it(`should allow paginating for ${test.api}/comments by path`, () => {
    let commentId1, commentId2, nextPage;
    return cloud.withOptions({ qs: { path: jpgFileBody.path } }).post(`${test.api}/comments`, commentPayload)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.withOptions({ qs: { path: jpgFileBody.path } }).post(`${test.api}/comments`, commentPayload))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId2);
        expect(r.response.headers['elements-next-page-token']).to.exist;
        nextPage = r.response.headers['elements-next-page-token'];
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, nextPage, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId1);
        expect(r.response.headers['elements-next-page-token']).to.not.exist;
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 2 , path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(2) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { path: jpgFileBody.path } }).delete(`${test.api}/comments/${commentId1}`))
      .then(r => cloud.withOptions({ qs: { path: jpgFileBody.path } }).delete(`${test.api}/comments/${commentId2}`));
  });

  it(`should allow CRDS for ${test.api}/comments by path`, () => cloud.withOptions({ qs: { path: jpgFileBody.path } }).crds(`${test.api}/comments`,commentPayload));

  it(`should handle raw parameter for ${test.api}/comments`, () => {
    let commentId;
    return cloud.post(`${test.api}/${jpgFileBody.feedId}/comments`, commentPayload)
      .then(r => commentId = r.body.id)
      .then(r => cloud.withOptions({ qs: { raw: true }}).get(`${test.api}/${jpgFileBody.feedId}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${jpgFileBody.feedId}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${jpgFileBody.feedId}/comments/${commentId}`));
  });
});
