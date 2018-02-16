'use strict';

const documents = require('../assets/documents');
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const folderPayload = require('./../assets/folders');
const random = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;
folderPayload.path += `-${random}`;
folderPayload.name += `-${random}`;

//Overriding as we're getting a lot 429s here
documents.override('folders', () => {
  suite.forElement('documents', 'folders', (test) => {
    afterEach(done => {
      //We were getting a 429 before this
      setTimeout(done, 4000);
    });

    let folder;
    before(done => {
      return cloud.post(test.api, folderPayload)
        .then(r => folder = r.body)
        .then(() => tools.sleep(3)) //Need some time to process the silly requests
        .then(() => done());
    });
    after(() => cloud.delete(`${test.api}/${folder.id}`));

    it('should allow CD /folders and DELETE /folders/:id', () => {
      let folder1, folder2;
      let random1 = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;
      folderPayload.path += `-${random1}`;
      folderPayload.name += `-${random1}`;
      return cloud.post('/hubs/documents/folders', folderPayload)
        .then(r => folder1 = r.body)
        .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'))
        .then(() => cloud.post('/hubs/documents/folders', folderPayload))
        .then(r => folder2 = r.body)
        .then(r => cloud.delete(`/hubs/documents/folders/${folder2.id}`));
    });

    it('should allow GET /folders/contents and GET /folders/:id/contents', () => {
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/contents')
        .then(r => cloud.get(`/hubs/documents/folders/${folder.id}/contents`));
    });

    it('should allow RU /folders/metadata and RU /folders/:id/metadata', () => {
      let updatedFolder,
        folderTemp = { path: `/a-${folder.name}` };
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
        .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp))
        .then(r => updatedFolder = r.body)
        .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
        .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));
    });

    it('should allow POST /folders/copy and POST /folders/:id/copy', () => {
      const copy1 = { path: `/churrosCopy1${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };
      const copy2 = { path: `/churrosCopy2${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };
      let folderCopy1, folderCopy2;
      return cloud.withOptions({ qs: { path: folder.path } }).post('/hubs/documents/folders/copy', copy1)
        .then(r => folderCopy1 = r.body)
        .then(() => cloud.post(`/hubs/documents/folders/${folder.id}/copy`, copy2))
        .then(r => folderCopy2 = r.body)
        .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy1.id}`))
        .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy2.id}`));
    });
  });
});

//Overriding as we're getting a lot 429s here
documents.override('files', () => {
  suite.forElement('documents', 'files', (test) => {
    afterEach(done => {
      //We were getting a 429 before this
      setTimeout(done, 2500);
    });
    let path = `${__dirname}/../assets/brady.jpg`,
      query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` },
      file;
    before(done => {
      return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
        .then(r => file = r.body)
        .then(r => done());
    });
    after(() => cloud.delete(`${test.api}/${file.id}`));

    it('should allow CRD /files and RD /files/:id', () => {
      let pathFile;
      return cloud.get(`/hubs/documents/files/${file.id}`)
        .then(() => cloud.withOptions({ qs: Object.assign({}, { path: `${query.path}-ayy` }) }).postFile('/hubs/documents/files', path))
        .then(r => pathFile = r.body)
        .then(() => cloud.withOptions({ qs: { path: pathFile.path } }).get('/hubs/documents/files'))
        .then(r => cloud.withOptions({ qs: { path: pathFile.path } }).delete('/hubs/documents/files'));
    });

    it('should allow GET /files/links and /files/:id/links', () => {
      return cloud.get(`/hubs/documents/files/${file.id}/links`)
        .then(() => cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links'));
    });

    it('should allow RU /files/metadata and RU /files/:id/metadata', () => {
      let updatedFile,
        fileTemp = { path: `/a-${file.name}` };
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/metadata')
        .then(r => cloud.withOptions({ qs: { path: file.path } }).patch('/hubs/documents/files/metadata', fileTemp))
        .then(r => updatedFile = r.body)
        .then(r => cloud.patch(`/hubs/documents/files/${updatedFile.id}/metadata`, file))
        .then(r => cloud.get(`/hubs/documents/files/${file.id}/metadata`));
    });

    it('should allow POST /files/copy and POST /files/:id/copy', () => {
      const copy1 = { path: '/churrosCopy1' + tools.random() },
        copy2 = { path: '/churrosCopy2' + tools.random() };
      let fileCopy1, fileCopy2;
      return cloud.withOptions({ qs: { path: file.path } }).post('/hubs/documents/files/copy', copy1)
        .then(r => fileCopy1 = r.body)
        .then(() => cloud.withOptions({ qs: { path: file.path } }).post('/hubs/documents/files/copy', copy2))
        .then(r => fileCopy2 = r.body)
        .then(() => cloud.delete(`/hubs/documents/files/${fileCopy1.id}`))
        .then(() => cloud.delete(`/hubs/documents/files/${fileCopy2.id}`));
    });
  });
});

documents.all();
