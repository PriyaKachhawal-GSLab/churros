'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('documents', 'files', (test) => {
  let path = __dirname + '/assets/Tombrady.jpg';
  let fileId, filePath, revisionId, hashFileId, hashFilePath;
  let query = { path: `/bradyChurros-${tools.random()}.jpg` };
  let hashQuery = { path: `/bradyChurros#${tools.random()}.jpg` };

  const fileWrap = (cb) => {
    let file;

    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => {
        file = r.body;
        expect(r.body.parentFolderId).to.not.be.null;
        expect(r.body.properties.mimeType).to.be.equal('image/jpeg');
      })
      .then(r => cb(file))
      .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));
  };

  const hashFileWrap = (cb) => {
    let file;

    return cloud.withOptions({ qs: hashQuery }).postFile('/hubs/documents/files', path)
      .then(r => {
        file = r.body;
        expect(r.body.parentFolderId).to.not.be.null;
        expect(r.body.properties.mimeType).to.be.equal('image/jpeg');
      })
      .then(r => cb(file))
      .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));
  };

  let query1 = { path: `/a-${tools.randomStr(5)}/brady-${tools.random()}.jpg` };
  let id;
  it('should allow POST file with implicit path', () => {
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => id = r.body.id)
      .then(r => cloud.delete(`/hubs/documents/files/${id}`));
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

  it('should allow CRD /files with hash path', () => {
    let file;
    return cloud.withOptions({ qs: hashQuery }).postFile('/hubs/documents/files', path)
      .then(r => file = r.body)
      .then(() => cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files'))
      .then(r => cloud.withOptions({ qs: { path: file.path } }).delete('/hubs/documents/files'));
  });

  it('should allow RU /files/metadata and RU /files/:id/metadata', () => {
    const cb = (file) => {
      let updatedFile;
      let fileTemp = {
        path: `/a-${file.name}`
      };
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/metadata')
        .then(r => cloud.withOptions({ qs: { path: file.path } }).patch('/hubs/documents/folders/metadata', fileTemp))
        .then(r => updatedFile = r.body)
        .then(r => cloud.patch(`/hubs/documents/files/${updatedFile.id}/metadata`, file))
        .then(r => cloud.get(`/hubs/documents/files/${file.id}/metadata`));
    };

    return fileWrap(cb);
  });

  it('should allow RU /files/metadata and RU /files/:id/metadata with implicit path', () => {
    const cb = (file) => {
      let updatedFile;
      let fileTemp = {
        path: `/a-${tools.randomStr(5)}/a-${file.name}`
      };
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/metadata')
        .then(r => cloud.withOptions({ qs: { path: file.path } }).patch('/hubs/documents/folders/metadata', fileTemp))
        .then(r => updatedFile = r.body)
        .then(r => cloud.patch(`/hubs/documents/files/${updatedFile.id}/metadata`, file))
        .then(r => cloud.get(`/hubs/documents/files/${file.id}/metadata`));
    };

    return fileWrap(cb);
  });

  it('should allow RU /files/metadata with hash path', () => {
    const cb = (file) => {
      let updatedFile;
      let fileTemp = {
        path: `/a-${tools.randomStr(5)}/a#${file.name}`
      };
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/metadata')
        .then(r => cloud.withOptions({ qs: { path: file.path } }).patch('/hubs/documents/folders/metadata', fileTemp))
        .then(r => updatedFile = r.body)
        .then(r => cloud.withOptions({ qs: { path: updatedFile.path } }).patch('/hubs/documents/folders/metadata', file))
    };
    return hashFileWrap(cb);
  });

  it('should allow R /files/links and R /files/:id/links', () => {
    const cb = (file) => {
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links')
        .then(r => cloud.get(`/hubs/documents/files/${file.id}/links`));
    };
    return fileWrap(cb);
  });

  it('should allow R /files/links with hash path', () => {
    const cb = (file) => {
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links');
    };
    return hashFileWrap(cb);
  });

  it('should allow POST /files/copy and POST /files/:id/copy', () => {
    const copy1 = { path: '/churrosCopy' + tools.randomStr("abcdeiouABCDEIOU", 6) };
    const copy2 = { path: '/churrosCopy' + tools.randomStr("abcdeiouABCDEIOU", 6) };

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

  it('should allow POST /files/copy and POST /files/:id/copy with implicit path', () => {
    const copy1 = { path: `/a-${tools.randomStr(5)}` + '/churrosCopy' + tools.randomStr("abcdeiouABCDEIOU", 5) };
    const copy2 = { path: `/a-${tools.randomStr(5)}` + '/churrosCopy' + tools.randomStr("abcdeiouABCDEIOU", 5) };

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

  before(() => cloud.withOptions({ qs: { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` } }).postFile(test.api, path)
    .then(r => {
      fileId = r.body.id;
      filePath = r.body.path;
    }));

  after(() => cloud.delete(`${test.api}/${fileId}`));

  before(() => cloud.withOptions({ qs: { path: `/brady#${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` } }).postFile(test.api, path)
    .then(r => {
      hashFileId = r.body.id;
      hashFilePath = r.body.path;
    }));

  after(() => cloud.delete(`${test.api}/${hashFileId}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
    return cloud.get(`${test.api}/${fileId}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.get(`${test.api}/${fileId}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
    return cloud.withOptions({ qs: { path: `${filePath}` } }).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: { path: `${filePath}` } }).get(`${test.api}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by hash path', () => {
    return cloud.withOptions({ qs: { path: `${hashFilePath}` } }).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: { path: `${hashFilePath}` } }).get(`${test.api}/revisions/${revisionId}`));
  });

});