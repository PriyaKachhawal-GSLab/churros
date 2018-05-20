'use strict';

const tools = require('core/tools');
const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');

const pathUpdateString = "/CELogo-Update.png";

const pathUpdate = () => ({
  "path": pathUpdateString
});

suite.forElement('documents', 'files', (test) => {
  let query = { path: `/churros/CloudElements-${tools.random()}.png` };
  let path = __dirname + '/assets/CE_logo.png';
  let jpgFileBody,revisionId;

  before(() => cloud.withOptions({ qs : { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg`, overwrite: true } }).postFile(test.api, path)
  .then(r => {
    jpgFileBody = r.body;
  }));

  after(() => cloud.delete(`${test.api}/${jpgFileBody.id}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
      return cloud.get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => {
        revisionId = r.body[0].id;
        expect(r.body[0]).to.have.property('fileId');
        expect(r.body[0]).to.have.property('filePath');
      })
      .then(() => cloud.get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: {path : `${jpgFileBody.path}`} }).get(`${test.api}/revisions`)
      .then(r => {
        revisionId = r.body[0].id;
        expect(r.body[0]).to.have.property('fileId');
        expect(r.body[0]).to.have.property('filePath');
      })
      .then(() => cloud.withOptions({ qs: {path : `${jpgFileBody.path}`} }).get(`${test.api}/revisions/${revisionId}`));
  });


  it('should allow CRUD cycle by id', () => {
    let fileId = -1;
    return cloud.withOptions({ qs: query }).postFile(test.api, path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}`, (r) => expect(r).to.have.statusCode(200) && expect(r.response.headers['content-type']).to.equal('image/png')))
      .then(r => cloud.get(`${test.api}/${fileId}/links`))
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, pathUpdate()))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });

  it('should allow CRUD cycle by path', () => {
    let fileId = -1;
    return cloud.withOptions({ qs: query }).postFile(test.api, path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.withOptions({ qs: query }).get(`${test.api}/links`))
      .then(r => cloud.withOptions({ qs: query }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: query }).get(test.api, (r) => expect(r).to.have.statusCode(200) && expect(r.response.headers['content-type']).to.equal('image/png')))
      .then(r => cloud.withOptions({ qs: query }).patch(`${test.api}/metadata`, pathUpdate()))
      .then(r => cloud.withOptions({ qs: { path: `/churros${pathUpdateString}` } }).delete(test.api));
  });

  it('should allow GET /files/:id/links for a root file', () => {
    let fileId;
    return cloud.withOptions({ qs: { path: '/rootChurro.png' } }).postFile(test.api, path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}/links`))
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.cloudElementsLink).to.not.be.empty;
      })
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });
});
