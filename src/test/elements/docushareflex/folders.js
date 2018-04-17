const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const folderPayload = require('./assets/folders');

suite.forElement('documents', 'folders', (test) => {

  const folderWrap = (cb) => {
    let folder;
    let random = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;
    folderPayload.path += `-${random}`;
    folderPayload.name += `-${random}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder = r.body)
      .then(r => cb(folder))
      .then(r => cloud.withOptions({ qs: { path: folder.path } }).delete('/hubs/documents/folders'));
  };

  it('should allow CD /folders and DELETE /folders/:id', () => {
    let folder1, folder2;
    let random1 = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;
    folderPayload.path += `-${random1}`;
    folderPayload.name += `-${random1}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder1 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'))
      .then(() => { 
        folderPayload.path += '-2ndcopy';
        folderPayload.name += '-2ndcopy';
        return cloud.post('/hubs/documents/folders', folderPayload);
      })
      .then(r => folder2 = r.body)
      .then(r => cloud.delete(`/hubs/documents/folders/${folder2.id}`));
  });


  it('should allow GET /folders/contents and GET /folders/:id/contents', () => {
    const cb = (folder) => {
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/contents')
        .then(r => cloud.get(`/hubs/documents/folders/${folder.id}/contents`));
    };

    return folderWrap(cb);
  });

  test.withApi(`${test.api}/contents`).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);

  it('should allow RU /folders/metadata and RU /folders/:id/metadata', () => {
    const cb = (folder) => {
      let updatedFolder;
      let folderTemp = {
        path: `/a-${folder.name}`
      };
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
        .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp))
        .then(r => updatedFolder = r.body)
        .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
        .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));
    };

    return folderWrap(cb);
  });
});