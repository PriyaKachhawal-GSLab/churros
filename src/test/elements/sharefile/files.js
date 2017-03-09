'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const rootFolder = '/My Files & Folders';
suite.forElement('documents', 'files', (test) => {
  let query = { path: rootFolder + `/file-${tools.random()}.txt` };
  let metadataPatch = { path: rootFolder + `/file-${tools.random()}.txt` };
  let fileId;
  let copyPath = { path: rootFolder + `/churros-${tools.random()}.txt` };

  it('Testing file uploading/getting/deleting', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.postFile('/hubs/documents/files', path, { qs: query })
      .then(r => fileId = r.body.id)
      .then(r => cloud.get('/hubs/documents/files' + '/' + fileId))
      .then(r => cloud.get('/hubs/documents/files' + '/' + fileId + '/metadata'))
      .then(r => cloud.withOptions({ qs: query }).get('/hubs/documents/files/metadata'))
      .then(r => cloud.withOptions({ qs: query }).get('/hubs/documents/files'))
      .then(r => cloud.withOptions({ qs: query }).delete('/hubs/documents/files'));

  });

  it('Testing file metadataing', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.postFile('/hubs/documents/files', path, { qs: query })
      .then(r => fileId = r.body.id)
      .then(r => cloud.withOptions({ qs: query }).patch('hubs/documents/files/metadata', metadataPatch))
      .then(r => cloud.patch('hubs/documents/files/' + fileId + '/metadata', metadataPatch))
      .then(r => cloud.withOptions({ qs: metadataPatch }).delete('/hubs/documents/files'));

  });

  it('Testing file copy and delete', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.postFile('/hubs/documents/files', path, { qs: query })
      .then(r => fileId = r.body.id)
      .then(r => cloud.get('/hubs/documents/files' + '/' + fileId + '/metadata'))
      .then(r => cloud.withOptions({ qs: { path: r.body.path } }).post('/hubs/documents/files/copy', copyPath))
      .then(r => copyPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: copyPath } }).delete('/hubs/documents/files'));
  });

  it('Testing file deleting', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.postFile('/hubs/documents/files', path, { qs: query })
      .then(r => fileId = r.body.id)
      .then(r => cloud.delete('/hubs/documents/files/' + fileId));
  });

  it('should support links for files', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.postFile('/hubs/documents/files', path, { qs: query })
      .then(r => fileId = r.body.id)
      .then(r => cloud.get("/hubs/documents/files/" + fileId + "/links"))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body.providerViewLink).to.not.be.null && expect(r.body).to.not.contain.key('raw'))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId));
  });

  it('should support links for files/links with raw payload', () => {
    let path = __dirname + '/assets/file.txt';
    let filePath;
    return cloud.postFile('/hubs/documents/files', path, { qs: query })
      .then(r => { fileId = r.body.id; filePath = r.body.path; })
      .then(r => cloud.withOptions({ qs: { path: filePath, raw: true } }).get("/hubs/documents/files/links"))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body.providerViewLink).to.not.be.null && expect(r.body).to.contain.key('raw'))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId));
  });
});
