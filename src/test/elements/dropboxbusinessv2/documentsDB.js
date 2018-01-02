'use strict';

const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const suite = require('core/suite');
const props = require('core/props');
const folderPayload = require('./assets/folders');
const faker = require('faker');
let memberId = props.getForKey('dropboxbusinessv2', 'username');
exports.all = () => {
  exports.files();
  exports.folders();
  exports.storage();
  exports.search();
  exports.ping();
};

exports.files = () => {
  suite.forElement('documents', 'files', (test) => {

    let path = __dirname + '/assets/brady.jpg';
    let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg`, overwrite:true };


    const fileWrap = (cb) => {
      let file;

      return cloud.withOptions({ qs: query, headers: { "Elements-As-Team-Member": memberId } }).postFile('/hubs/documents/files', path)
        .then(r => file = r.body)
        .then(r => cb(file))
        .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`/hubs/documents/files/${file.id}`));
    };

    it('should allow CRD /files and RD /files/:id', () => {
      const cb = (file) => {
        return cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`/hubs/documents/files/${file.id}`);
      };

      let file;
      return fileWrap(cb)
        .then(() => cloud.withOptions({ qs: query, headers: { "Elements-As-Team-Member": memberId } }).postFile('/hubs/documents/files', path))
        .then(r => file = r.body)
        .then(() => cloud.withOptions({ qs: { path: file.path }, headers: { "Elements-As-Team-Member": memberId } }).get('/hubs/documents/files'))
        .then(r => cloud.withOptions({ qs: { path: file.path }, headers: { "Elements-As-Team-Member": memberId } }).delete('/hubs/documents/files'));
    });

    it('should allow GET /files/links and /files/:id/links with correct download and view URLs', () => {
      const cb = (file) => {
        return cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } })
          .get(`/hubs/documents/files/${file.id}/links`)
          .then(r => expect(r.body).to.not.contain.key('raw'))
          .then(() => cloud.withOptions({
              qs: { path: file.path },
              headers: { "Elements-As-Team-Member": memberId }
            })
            .get('/hubs/documents/files/links')
            .then(r => {
              expect(r.body).to.not.contain.key('raw');
              expect(r.body.providerLink).to.contain('dl=1');
              expect(r.body.providerViewLink).to.contain('dl=0');
          })
          );
      };

      return fileWrap(cb);
    });

    it('should allow GET /files/links and /files/:id/links with raw payload', () => {
      const cb = (file) => {
        return cloud.withOptions({ qs: { raw: true }, headers: { "Elements-As-Team-Member": memberId } })
          .get(`/hubs/documents/files/${file.id}/links`)
          .then(r => expect(r.body).to.contain.key('raw'))
          .then(() => cloud.withOptions({
              qs: { path: file.path, raw: true },
              headers: { "Elements-As-Team-Member": memberId }
            })
            .get('/hubs/documents/files/links')
            .then(r => expect(r.body).to.contain.key('raw'))
          );
      };

      return fileWrap(cb);
    });

    it('should allow RU /files/metadata and RU /files/:id/metadata', () => {
      const cb = (file) => {
        let updatedFile;
        let fileTemp = {
          path: `/a-${file.name}`
        };
        return cloud.withOptions({ qs: { path: file.path }, headers: { "Elements-As-Team-Member": memberId } }).get('/hubs/documents/files/metadata')
          .then(r => cloud.withOptions({ qs: { path: file.path }, headers: { "Elements-As-Team-Member": memberId } }).patch('/hubs/documents/folders/metadata', fileTemp))
          .then(r => updatedFile = r.body)
          .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).patch(`/hubs/documents/files/${updatedFile.id}/metadata`, file))
          .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`/hubs/documents/files/${file.id}/metadata`));
      };

      return fileWrap(cb);
    });

    it('should allow POST /files/copy and POST /files/:id/copy', () => {
      const copy1 = { path: `/${faker.system.fileName()}` };
      const copy2 = { path: `/${faker.system.fileName()}` };

      const cb = (file) => {
        let fileCopy1, fileCopy2;
        return cloud.withOptions({ qs: { path: file.path }, headers: { "Elements-As-Team-Member": memberId } }).post('/hubs/documents/files/copy', copy1)
          .then(r => fileCopy1 = r.body)
          .then(() => cloud.withOptions({ qs: { path: file.path }, headers: { "Elements-As-Team-Member": memberId } }).post('/hubs/documents/files/copy', copy2))
          .then(r => fileCopy2 = r.body)
          .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`/hubs/documents/files/${fileCopy1.id}`))
          .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`/hubs/documents/files/${fileCopy2.id}`));
      };

      return fileWrap(cb);
    });
  });
};

exports.storage = () => {
  suite.forElement('documents', 'storage', (test) => {
    test.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).should.return200OnGet();
  });
};

exports.search = () => {
  suite.forElement('documents', 'search', (test) => {

    test.withOptions({ qs:{'text':'abc'}, headers: { "Elements-As-Team-Member": memberId } }).should.return200OnGet();
  });
};

exports.ping = () => {
  suite.forElement('documents', 'ping', (test) => {

    test.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).should.return200OnGet();
  });
};

exports.folders = (test) => {
  suite.forElement('documents', 'folders', (test) => {
    let random = `${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20)}`;
    folderPayload.path += `-${random}`;
    folderPayload.name += `-${random}`;

    // let memberId = "dbmid:AADkTHIEUNMxlMLbejOdxXt8bZsciJP1sRE";
    const folderWrap = (cb) => {
      let folder;
      return cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).post('/hubs/documents/folders', folderPayload)
        .then(r => folder = r.body)
        .then(r => cb(folder))
        .then(r => cloud.withOptions({ qs: { path: folder.path }, headers: { "Elements-As-Team-Member": memberId } }).delete('/hubs/documents/folders'));
    };

    it('should allow CD /folders and DELETE /folders/:id', () => {
      let folder1, folder2;
      return cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).post('/hubs/documents/folders', folderPayload)
        .then(r => folder1 = r.body)
        .then(r => cloud.withOptions({ qs: { path: folder1.path }, headers: { "Elements-As-Team-Member": memberId } }).delete('/hubs/documents/folders'))
        .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).post('/hubs/documents/folders', folderPayload))
        .then(r => folder2 = r.body)
        .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`/hubs/documents/folders/${folder2.id}`));
    });


    it('should allow GET /folders/contents and GET /folders/:id/contents', () => {
      const cb = (folder) => {
        return cloud.withOptions({ qs: { path: folder.path }, headers: { "Elements-As-Team-Member": memberId } }).get('/hubs/documents/folders/contents')
          .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`/hubs/documents/folders/${folder.id}/contents`));
      };

      return folderWrap(cb);
    });

    it('should allow RU /folders/metadata and RU /folders/:id/metadata', () => {
      const cb = (folder) => {
        let updatedFolder;
        let folderTemp = {
          path: `/a-${folder.name}`
        };
        return cloud.withOptions({ qs: { path: folder.path }, headers: { "Elements-As-Team-Member": memberId } }).get('/hubs/documents/folders/metadata')
          .then(r => cloud.withOptions({ qs: { path: folder.path }, headers: { "Elements-As-Team-Member": memberId } }).patch('/hubs/documents/folders/metadata', folderTemp))
          .then(r => updatedFolder = r.body)
          .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`/hubs/documents/folders/${updatedFolder.id}/metadata`))
          .then(r => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).patch(`/hubs/documents/folders/${updatedFolder.id}/metadata`, folder));
      };

      return folderWrap(cb);
    });

    it('should allow POST /folders/copy and POST /folders/:id/copy', () => {

      const copy1 = { path: `/${faker.system.fileName()}` };
      const copy2 = { path: `/${faker.system.fileName()}` };

      const cb = (folder) => {
        let folderCopy1, folderCopy2;
        return cloud.withOptions({ qs: { path: folder.path }, headers: { "Elements-As-Team-Member": memberId } }).post('/hubs/documents/folders/copy', copy1)
          .then(r => folderCopy1 = r.body)
          .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).post(`/hubs/documents/folders/${folder.id}/copy`, copy2))
          .then(r => folderCopy2 = r.body)
          .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`/hubs/documents/folders/${folderCopy1.id}`))
          .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`/hubs/documents/folders/${folderCopy2.id}`));
      };

      return folderWrap(cb);
    });

  });
};
