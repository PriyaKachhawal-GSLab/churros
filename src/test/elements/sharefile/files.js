'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const Buffer = require('buffer').Buffer;
const logger = require('winston');
const faker = require('faker');

const rootFolder = '/My Files & Folders';

const checkSize = (fileSize, downloadedSize) => {
  logger.debug("File size: " + fileSize + ", Downloaded Size: " + downloadedSize);

  return (fileSize === downloadedSize);
};

suite.forElement('documents', 'files', (test) => {
  let query = { path: rootFolder + `/file-${faker.random.number()}.txt` };
  let metadataPatch = { path: rootFolder + `/file-${faker.random.number()}.txt` };
  let copyPath = { path: rootFolder + `/churros-${faker.random.number()}.txt` };
  let fileId;
  let filePath;

  it('should get file metadata by id/path', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.withOptions({ qs: query }).postFile(test.api, path)
      .then(r => { fileId = r.body.id, filePath = r.body.path; })
      .then(r => cloud.get('/hubs/documents/files/' + fileId))
      .then(r => cloud.get('/hubs/documents/files/' + fileId + '/metadata'))
      .then(r => cloud.withOptions({ qs: { path: filePath } }).get('/hubs/documents/files'))
      .then(r => cloud.withOptions({ qs: { path: filePath } }).get('/hubs/documents/files/metadata'))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId));
  });

  it('should delete file by path', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.withOptions({ qs: query }).postFile(test.api, path)
      .then(r => { fileId = r.body.id, filePath = r.body.path; })
      .then(r => cloud.withOptions({ qs: query }).delete('/hubs/documents/files'));
  });

  it('should patch file metadata by id/path', () => {
    let path = __dirname + '/assets/file.txt';
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt`, overwrite: true };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => { filePath = r.body.path; })
      .then(r => cloud.withOptions({ qs: { path: filePath } }).patch('hubs/documents/files/metadata', metadataPatch))
      .then(r => { fileId = r.body.id; })
      .then(r => cloud.delete(`${test.api}/${fileId}`))
      .then(r => cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path))
      .then(r => { fileId = r.body.id; })
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, metadataPatch))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });

  it('should copy file by id/path', () => {
    let path = __dirname + '/assets/file.txt';
    return cloud.withOptions({ qs: query }).postFile(test.api, path)
      .then(r => { fileId = r.body.id, filePath = r.body.path; })
      .then(r => cloud.get('/hubs/documents/files' + '/' + fileId + '/metadata'))
      .then(r => cloud.withOptions({ qs: { path: filePath } }).post('/hubs/documents/files/copy', copyPath))
      .then(r => cloud.withOptions({ qs: { path: r.body.path } }).delete('/hubs/documents/files'))
      .then(r => cloud.post('/hubs/documents/files/' + fileId + '/copy', copyPath))
      .then(r => cloud.delete('/hubs/documents/files/' + r.body.id));
  });

  it('should fail when copying file to existing file path without overwrite', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/assets/file.txt';
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt` };
    let query2 = { path: `${rootFolder}/file-${faker.random.number()}.txt` };

    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile('/hubs/documents/files', path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: false } }).post('/hubs/documents/files/copy', { path: filePath2 }, r => { expect(r).to.have.statusCode(409); }))
      .then(r => cloud.get(`/hubs/documents/files/${fileId2}/metadata`))
      .then(r => { expect(r).to.have.statusCode(200) && expect(r.body.id).to.equal(fileId2); })
      .then(r => cloud.delete('/hubs/documents/files/' + fileId1))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId2));
  });

  it('should succeed when copying file with existing file path with overwrite', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/assets/file.txt';
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt` };
    let query2 = { path: `${rootFolder}/file-${faker.random.number()}.txt` };

    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile('/hubs/documents/files', path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: true } }).post('/hubs/documents/files/copy', { path: filePath2 }))
      .then(r => { fileId2 = r.body.id; })
      .then(r => cloud.delete('/hubs/documents/files/' + fileId1))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId2));
  });

  it('should upload file by id/path', () => {
    let path = __dirname + '/assets/file.txt';
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt`, overwrite: true };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.delete(`${test.api}/${fileId}`))
      .then(r => cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path))
      .then(r => cloud.withOptions({ qs: { path: r.body.path } }).delete('/hubs/documents/files'));
  });

  it('should get file link by id/path', () => {
    let path = __dirname + '/assets/file.txt';
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt`, overwrite: true };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => { fileId = r.body.id, filePath = r.body.path; })
      .then(r => cloud.get(`${test.api}/${fileId}/links`))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body.providerViewLink).to.not.be.null && expect(r.body).to.not.contain.key('raw'))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });

  it('should support links for files/links with raw payload', () => {
    let path = __dirname + '/assets/file.txt';
    let filePath;
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt`, overwrite: true };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => {
        fileId = r.body.id;
        filePath = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath, raw: true } }).get('/hubs/documents/files/links'))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body.providerViewLink).to.not.be.null && expect(r.body).to.contain.key('raw'))
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });

  it('should validate unicode file download', () => {
    let path = __dirname + '/assets/unicode-file.txt';
    let fileSize;
    let downloadedSize;
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt`, overwrite: true };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => { fileId = r.body.id, filePath = r.body.path; })
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => fileSize = r.body.size)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => downloadedSize = Buffer.byteLength(r.body, "UTF-8"))
      .then(r => checkSize(fileSize, downloadedSize))
      .then(r => expect(r).to.be.true)
      .then(r => cloud.delete(`${test.api}/${fileId}`));
  });

  it('should return 404 for files/metadata when file does not exist', () => {
    let path = __dirname + '/assets/file.txt';
    let query1 = { path: `${rootFolder}/file-${faker.random.number()}.txt`, overwrite: true };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => { fileId = r.body.id, filePath = r.body.path; })
      .then(r => cloud.delete(`${test.api}/${fileId}`))
      .then(r => cloud.withOptions({ qs: { path: filePath } }).get('/hubs/documents/files/metadata', (r) => expect(r).to.have.statusCode(404)));
  });

});
