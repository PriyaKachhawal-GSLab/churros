'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const basePath = '/Shared/churros';
const chakram = require('chakram');
const expect = chakram.expect;


suite.forElement('documents', 'files', (test) => {
  let path = `${__dirname}/assets/Penguins.jpg`;
  let query = { path: `${basePath}/Penguins-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };
  let revisionId;
  let entry_id='7390d6ad-b7d0-49d9-949e-d98782dbc267';

  const fileWrap = (cb) => {
    let file;

    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => file = r.body)
      .then(r => cb(file))
      .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));
  };

  it('it should allow RS for documents/files/:id/revisions', () => {
      return cloud.get(`${test.api}/${entry_id}/revisions`)
      .then(r => {
        revisionId = r.body[0].id;
        expect(r.body[0]).to.have.property('id');
        expect(r.body[0]).to.have.property('fileName');
      })
      .then(() => cloud.get(`${test.api}/${entry_id}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: query }).get(`${test.api}/revisions`)
      .then(r => {
        revisionId = r.body[0].id;
        expect(r.body[0]).to.have.property('id');
        expect(r.body[0]).to.have.property('fileName');
      })
      .then(() => cloud.withOptions({ qs: query }).get(`${test.api}/revisions/${revisionId}`));
  });
  
  it('should allow CRD /files and RD /files/:id', () => {
    const cb = (file) => {
      return cloud.get(`/hubs/documents/files/${file.id}`);
    };

    let file;
    return fileWrap(cb)
      .then(() => cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path))
      .then(r => file = r.body)
      .then(() => cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files'))
      .then(r => cloud.withOptions({ qs: { path: file.path } }).delete('/hubs/documents/files'));
  });
 
  it('should allow GET /files/links and /files/:id/links', () => {
    const cb = (file) => {
      return cloud.get(`/hubs/documents/files/${file.id}/links`)
        .then(() => cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links'));
    };

    return fileWrap(cb);
  });

  it('should allow RU /files/metadata and RU /files/:id/metadata', () => {
    const cb = (file) => {
      let updatedFile;
      let fileTemp = {
        path: `${basePath}/a-${file.name}`
      };

      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/metadata')
        .then(r => cloud.withOptions({ qs: { path: file.path } }).patch('/hubs/documents/files/metadata', fileTemp))
        .then(r => updatedFile = r.body)
        .then(r => cloud.patch(`/hubs/documents/files/${updatedFile.id}/metadata`, file))
        .then(r => cloud.get(`/hubs/documents/files/${file.id}/metadata`));
    };

    return fileWrap(cb);
  });

  it('should allow POST /files/copy and POST /files/:id/copy', () => {
    const copy1 = { path: `${basePath}/churrosCopy1` + tools.random() };
    const copy2 = { path: `${basePath}/churrosCopy2` + tools.random() };

    const cb = (file) => {
      let fileCopy1, fileCopy2;
      return cloud.withOptions({ qs: { path: file.path } }).post('/hubs/documents/files/copy', copy1)
        .then(r => fileCopy1 = r.body)
        .then(() => cloud.withOptions({ qs: { path: file.path } }).post('/hubs/documents/files/copy', copy2))
        .then(r => fileCopy2 = r.body)
        .then(() => cloud.delete(`/hubs/documents/files/${fileCopy1.id}`))
        .then(() => cloud.delete(`/hubs/documents/files/${fileCopy2.id}`));
    };

    return fileWrap(cb);
  });
 

});
