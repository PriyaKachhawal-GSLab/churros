'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

suite.forElement('documents', 'files', (test) => {
  let path = __dirname + '/assets/brady.jpg';
  let query = { path: `/bradyChurros-${tools.random()}.jpg` };

  const fileWrap = (cb) => {
    let file;

    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => file = r.body)
      .then(r => cb(file))
      .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));
  };

  let query1 = { path: `/a-${tools.randomStr(5)}/brady-${tools.random()}.jpg` };
  let id;
  it('should allowpost file with implicit path', () => {
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

  it('should allow R /files/links and R /files/:id/links', () => {
    const cb = (file) => {
      return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links')
      .then(r => cloud.get(`/hubs/documents/files/${file.id}/links`));
    };
    return fileWrap(cb);
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
    const copy1 = { path: `/a-${tools.randomStr(5)}`+'/churrosCopy' + tools.randomStr("abcdeiouABCDEIOU", 6) };
    const copy2 = { path: `/a-${tools.randomStr(5)}`+'/churrosCopy' + tools.randomStr("abcdeiouABCDEIOU", 6) };

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
