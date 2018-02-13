const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');

suite.forElement('documents', 'files', (test) => {
  let path = __dirname + '/assets/brady.jpg';
  const fileWrap = (cb) => {
    let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };
    let file;

    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => file = r.body)
      .then(r => cb(file))
      .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));
  };

  it('should allow CRD /files and RD /files/:id', () => {
    let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };
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
    let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };
    const cb = (file) => {
      return cloud.get(`/hubs/documents/files/${file.id}/links`)
        .then(() => cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links'));
    };

    return fileWrap(cb, query);
  });

  it('should allow RU /files/metadata and RU /files/:id/metadata', () => {
    const cb = (file) => {
      let updatedFile;
      let fileTemp = {
        path: `/a-${file.name}`
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
    const copy1 = { path: '/churrosCopy1' + tools.random() };
    const copy2 = { path: '/churrosCopy2' + tools.random() };

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