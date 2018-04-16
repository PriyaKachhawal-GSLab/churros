'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const folderPayload = require('./assets/folders');
const basePath = '/Shared/churros';

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
      .then(() => cloud.post('/hubs/documents/folders', folderPayload))
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

  it('should allow paginating with page and pageSize for GET /folders/contents and GET /folders/:id/contents', () => {
    const getWithOptions = (api, option, result) => {
      return cloud.withOptions(option).get(api)
        .then((r) => {
          if (r.body && r.body.length > 0) {
            result.body = r.body;
            expect(result.body.length).to.be.below(option.qs.pageSize + 1);
            return r.response.headers['elements-next-page-token'];
          }
        });
    };

    const cb = (folder) => {
      const options = { qs: { path: folder.path } };
      const pageSize = options ? options.qs ? options.qs.pageSize ? options.qs.pageSize : 2 : 2 : 2;
      const page = options ? options.qs ? options.qs.page ? options.qs.page : 1 : 1 : 1;
      const options1 = Object.assign({}, options);
      options1.qs = Object.assign({}, options1.qs, { page: page, pageSize: pageSize });
      const options2 = Object.assign({}, options);
      options2.qs = Object.assign({}, options2.qs, { page: page + 1, pageSize: pageSize });
      const options3 = Object.assign({}, options);
      options3.qs = Object.assign({}, options3.qs, { page: page, pageSize: (pageSize * 2) });
      let result1 = { body: [] },
        result2 = { body: [] },
        result3 = { body: [] };

      return getWithOptions(`${test.api}/contents`, options1, result1)
        .then(nextPage => getWithOptions(`${test.api}/contents`, nextPage ? { qs: Object.assign({}, options2.qs, { pageSize: pageSize, nextPage: nextPage, page: page + 1 }) } : options2, result2))
        .then(nextPage => getWithOptions(`${test.api}/contents`, nextPage ? { qs: Object.assign({}, options3.qs, { pageSize: pageSize * 2 }) } : options3, result3))
        .then(() => getWithOptions(`${test.api}/${folder.id}/contents`, options1, result1))
        .then(nextPage => getWithOptions(`${test.api}/${folder.id}/contents`, nextPage ? { qs: Object.assign({}, options2.qs, { pageSize: pageSize, nextPage: nextPage, page: page + 1 }) } : options2, result2))
        .then(nextPage => getWithOptions(`${test.api}/${folder.id}/contents`, nextPage ? { qs: Object.assign({}, options3.qs, { pageSize: pageSize * 2 }) } : options3, result3));
    };

    return folderWrap(cb);
  });

  it('should allow RU /folders/metadata and RU /folders/:id/metadata', () => {
    const cb = (folder) => {
      let updatedFolder;
      let folderTemp = {
        path: `${basePath}/a-${folder.name}`
      };

      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
        .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp))
        .then(r => updatedFolder = r.body)
        .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
        .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));
    };

    return folderWrap(cb);
  });

  it('should allow POST /folders/copy and POST /folders/:id/copy', () => {
    const copy1 = { path: `${basePath}/churrosCopy1${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };
    const copy2 = { path: `${basePath}/churrosCopy2${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}` };

    const cb = (folder) => {
      let folderCopy1, folderCopy2;
      return cloud.withOptions({ qs: { path: folder.path } }).post('/hubs/documents/folders/copy', copy1)
        .then(r => folderCopy1 = r.body)
        .then(() => cloud.post(`/hubs/documents/folders/${folder.id}/copy`, copy2))
        .then(r => folderCopy2 = r.body)
        .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy1.id}`))
        .then(() => cloud.delete(`/hubs/documents/folders/${folderCopy2.id}`));
    };

    return folderWrap(cb);
  });
});
