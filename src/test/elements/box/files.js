'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const faker = require('faker');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customFields.json`);
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const commentPayload1 = tools.requirePayload(`${__dirname}/assets/comment.json`);
const commentPayload2 = tools.requirePayload(`${__dirname}/assets/comment.json`);
const lock = {
  "is_download_prevented": false,
  "expires_at": "2030-12-12T10:55:30-08:00"
};

suite.forElement('documents', 'files', (test) => {
  let id, path;
  before(done => {
    return cloud.withOptions({ qs: { path: `/brady-${faker.address.zipCode()}.jpg` } }).postFile(test.api, `${__dirname}/../assets/brady.jpg`)
      .then(r => {
        id = r.body.id;
        path = r.body.path;
      })
      .then(r => done());
  });
  after(() => cloud.delete(`${test.api}/${id}`));
  afterEach(done => {
    //We were getting a 429 before this
    setTimeout(done, 2500);
  });

  it('should allow PUT /files/:id/lock and DELETE /files/:id/lock', () => {
    return cloud.put(`${test.api}/${id}/lock`, null, null, lock)
      .then(r => cloud.delete(`${test.api}/${id}/lock`));
  });

  it('should allow links for files/:id/links without raw payload', () => {
    return cloud.get(`${test.api}/${id}/links`)
      .then(r => expect(r.body).to.not.contain.key('raw'));
  });

  it('should allow links for files/links with raw payload', () => {
    return cloud.withOptions({ qs: { path: path, raw: true } }).get(`${test.api}/links`)
      .then(r => expect(r.body).to.contain.key('raw'));
  });

  it('should fail when copying file with existing file name', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/../assets/brady.jpg';
    let query1 = { path: `/brady-${faker.address.zipCode()}.jpg` };
    let query2 = { path: `/brady-${faker.address.zipCode()}.jpg` };

    return cloud.withOptions({ qs: query1 }).postFile(test.api, path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile(test.api, path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: false } }).post('/hubs/documents/files/copy', { path: filePath2 }, r => { expect(r).to.have.statusCode(409); }))
      .then(r => cloud.get(`/hubs/documents/files/${fileId2}/metadata`))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body.id).to.equal(fileId2))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId1))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId2));
  });


  it('should allow CRUDS for /files/:id/custom-fields', () => {
    let tempKey;
    let updatePayload = {
      "template": "customer",
      "path": "/" + temPayload.fields[0].key,
      "value": "madhuri",
      "scope": "enterprise"
    };
    let templateKeyPayload = {
      "path": "/" + temPayload.fields[0].key,
      "value": "madhuri",
      "scope": "enterprise"
    };
    return cloud.post('/hubs/documents/custom-fields/templates', temPayload)
      .then(r => {
        tempKey = r.body.templateKey;
        updatePayload.template = r.body.templateKey;
        payload.template = r.body.templateKey;
      })
      .then(r => cloud.get(`/hubs/documents/files/${id}/custom-fields`))
      .then(r => cloud.post(`/hubs/documents/files/${id}/custom-fields`, payload))
      .then(r => cloud.put(`/hubs/documents/files/${id}/custom-fields`, updatePayload))
      .then(r => cloud.patch(`/hubs/documents/files/${id}/custom-fields`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`/hubs/documents/files/${id}/custom-fields/${tempKey}`))
      .then(r => cloud.patch(`/hubs/documents/files/${id}/custom-fields/${tempKey}`, templateKeyPayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).delete(`/hubs/documents/files/${id}/custom-fields/${tempKey}`));
  });

  /**
   * /files/revisions endpoint doesn't return current revision.
   * While we don't offer the POST /revisions endpoint we'll need to hardcode the file data
   */
  it('should allow RS for documents/files/:id/revisions', () => {
    const fileId = 158316363797;
    let revisionId;
    return cloud.get(`${test.api}/${fileId}/revisions`)
      .then(r => {
        expect(r.body[0]).to.contain.key('id');
        revisionId = r.body[0].id;
      })
      .then(() => cloud.get(`${test.api}/${fileId}/revisions/${revisionId}`));
  });

  it('should allow RS for documents/files/revisions by path', () => {
    let options = { qs: { path: '/TestFolderDoNoDelete/Sample WordDoc.docx' } };
    let revisionId;
    return cloud.withOptions(options).get(`${test.api}/revisions`)
      .then(r => {
        expect(r.body[0]).to.contain.key('id');
        revisionId = r.body[0].id;
      })
      .then(() => cloud.withOptions(options).get(`${test.api}/revisions/${revisionId}`));
  });

  it(`should allow CRUDS for ${test.api}/:id/comments`, () => cloud.cruds(`${test.api}/${id}/comments`, commentPayload1));

  it(`should allow CRUDS for ${test.api}/comments by path`, () => cloud.withOptions({ qs: { path } }).cruds(`${test.api}/comments`, commentPayload1));

  it(`should allow paginating for ${test.api}/:id/comments`, () => {
    let commentId1, commentId2;
    return cloud.post(`${test.api}/${id}/comments`, commentPayload1)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.post(`${test.api}/${id}/comments`, commentPayload2))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 2 } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 3 } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${id}/comments/${commentId1}`))
      .then(r => cloud.delete(`${test.api}/${id}/comments/${commentId2}`));
  });

  it(`should allow paginating for ${test.api}/comments by path`, () => {
    let commentId1, commentId2;
    return cloud.withOptions({ qs: { path } }).post(`${test.api}/comments`, commentPayload1)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.withOptions({ qs: { path } }).post(`${test.api}/comments`, commentPayload2))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1, path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 2, path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 3, path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.be.empty)
      .then(r => cloud.withOptions({ qs: { path } }).delete(`${test.api}/comments/${commentId1}`))
      .then(r => cloud.withOptions({ qs: { path } }).delete(`${test.api}/comments/${commentId2}`));
  });

  it(`should handle raw parameter for ${test.api}/comments`, () => {
    let commentId;
    return cloud.post(`${test.api}/${id}/comments`, commentPayload1)
      .then(r => commentId = r.body.id)
      .then(r => cloud.withOptions({ qs: { raw: true }}).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${id}/comments/${commentId}`));
  });
});
