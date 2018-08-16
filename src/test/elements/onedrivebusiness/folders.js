'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/folders');
const build = (overrides) => Object.assign({}, payload, overrides);
const folderPayload = build({ name: `churros-${tools.random()}`, path: `/${tools.random()}` });
const folderPayload1 = build({ name: `churros-${tools.random()}`, path: `/${tools.random()}/${tools.random()}` });
const folderPayload2 = build({ name: `churros-${tools.random()}#${tools.random()}`, path: `/${tools.random()}/${tools.random()}#${tools.random()}` });
const expect = require('chakram').expect;

suite.forElement('documents', 'folders', (test) => {
  const folderWrap = (cb) => {
    let folder;
    let random = `${tools.random()}`;
    folderPayload.path += `/${random}`;
    folderPayload.name += `-${random}`;

    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => {
        folder = r.body;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cb(folder))
      .then(r => cloud.withOptions({ qs: { path: folder.path } }).delete('/hubs/documents/folders'));
  };

  const folderWrapHash = (cb) => {
    let folder;
    let random = `${tools.random()}#${tools.random()}`;
    folderPayload.path += `/${random}`;
    folderPayload.name += `-${random}`;

    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => {
        folder = r.body;
        expect(r.body.parentFolderId).to.not.be.null;
      })
      .then(r => cb(folder))
      .then(r => cloud.withOptions({ qs: { path: folder.path } }).delete('/hubs/documents/folders'));
  };

  it('should allow CD /folders', () => {
    let folder1;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder1 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder1.path } }).delete('/hubs/documents/folders'));
  });

  it('should allow CD /folders with implicit path', () => {
    let folder2;
    return cloud.post('/hubs/documents/folders', folderPayload1)
      .then(r => folder2 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder2.path } }).delete('/hubs/documents/folders'));
  });

  it('should allow CD /folders with hash path', () => {
    let folder3;
    return cloud.post('/hubs/documents/folders', folderPayload2)
      .then(r => folder3 = r.body)
      .then(r => cloud.withOptions({ qs: { path: folder3.path } }).delete('/hubs/documents/folders'));
  });

  it('should allow C /folders and DELETE /folders/:id', () => {
    let folder2;
    folderPayload.path += `-${tools.random()}`;
    folderPayload.name += `-${tools.random()}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
      .then(r => folder2 = r.body)
      .then(r => cloud.delete(`/hubs/documents/folders/${folder2.id}`));
  });

  it('should allow C /folders and DELETE /folders/:id with hash path', () => {
    let folder2;
    folderPayload.path += `-${tools.random()}#${tools.random()}`;
    folderPayload.name += `-${tools.random()}#${tools.random()}`;
    return cloud.post('/hubs/documents/folders', folderPayload)
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

  it('should allow GET /folders/contents and GET /folders/:id/contents with hash path', () => {
    const cb = (folder) => {
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/contents')
        .then(r => cloud.get(`/hubs/documents/folders/${folder.id}/contents`));
    };

    return folderWrapHash(cb);
  });

  test.withApi(`${test.api}/contents`).withOptions({ qs: { path: '/' } }).should.supportNextPagePagination(1);

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

  it('should allow RU /folders/metadata and RU /folders/:id/metadata with implicit path', () => {
    const cb = (folder) => {
      let updatedFolder;
      let folderTemp = {
        path: `/b-${tools.randomStr(5)}/a-${folder.name}`
      };
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
        .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp))
        .then(r => updatedFolder = r.body)
        .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
        .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));
    };

    return folderWrap(cb);
  });

  it('should allow RU /folders/metadata and RU /folders/:id/metadata with hash path', () => {
    const cb = (folder) => {
      let updatedFolder3;
      let folderTemp3 = {
        path: `/${tools.randomStr(5)}/a-${folder.name}#${tools.random()}`
      };
      return cloud.withOptions({ qs: { path: folder.path } }).get('/hubs/documents/folders/metadata')
        .then(r => cloud.withOptions({ qs: { path: folder.path } }).patch('/hubs/documents/folders/metadata', folderTemp3))
        .then(r =>
          updatedFolder3 = r.body)
        .then(r => cloud.get(`/hubs/documents/folders/${updatedFolder3.id}/metadata`))
        .then(r => cloud.patch(`/hubs/documents/folders/${updatedFolder3.id}/metadata`, folder));
    };
    return folderWrapHash(cb);
  });

  /* before(() => cloud.withOptions({ qs: { path: `/` } }).get(`${test.api}/contents`)
        .then(r => folderId = r.body.filter(obj => obj.name === "dontdelete_folder_churros")[0].id));

    it('should allow GET /folders/contents with name', () => {
      return cloud.withOptions({ qs: { path: `/dontdelete_folder_churros`, where: "name='dontdelete_text_churros'" } }).get(`${test.api}/contents`)
        .then(r => expect(r.body[0].name).to.contain('dontdelete_text_churros'));
    });

    it('should allow GET /folders/contents with extension', () => {
      return cloud.withOptions({ qs: { path: `/dontdelete_folder_churros`, where: "extension='.txt'" } }).get(`${test.api}/contents`)
        .then(r => expect(r.body[0].name).to.contain('.txt'));
    });

    it('should allow GET /folders/:id/contents with name', () => {
      return cloud.withOptions({ qs: { where: "name='dontdelete_text_churros'" } }).get(`${test.api}/${folderId}/contents`)
        .then(r => expect(r.body[0].name).to.contain('dontdelete_text_churros'));
    });

    it('should allow GET /folders/:id/contents with extension', () => {
      return cloud.withOptions({ qs: { where: "extension='.txt'" } }).get(`${test.api}/${folderId}/contents`)
        .then(r => expect(r.body[0].name).to.contain('.txt'));
    });*/

});