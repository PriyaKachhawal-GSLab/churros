'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = require('./assets/files');
const expect = require('chakram').expect;
const faker = require('faker');
const folderPayload = require('./assets/folders');
const randomInt = tools.randomInt();
folderPayload.path += randomInt;
folderPayload.name += randomInt;
const commentPayload1 = tools.requirePayload(`${__dirname}/assets/comment.json`);
const commentPayload2 = tools.requirePayload(`${__dirname}/assets/comment.json`);

payload.path = `/${faker.random.number()}`;

const updatePayload = {
  name: faker.random.number(),
  path: `/${faker.random.number()}`
};

const propertiesPayload = {
  "properties": {
    "customKey": faker.random.number()
  }
};

suite.forElement('documents', 'files', { payload: payload }, (test) => {
  let jpgFileBody, textFileBody, textFileBody2, revisionId,
    jpgFile = __dirname + '/assets/Penguins.jpg',
    textFile = __dirname + '/assets/textFile.txt';
  let query = { path: `/Penguins-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };

  before(() => cloud.withOptions({ qs: query }).postFile(test.api, jpgFile)
    .then(r => jpgFileBody = r.body));

  after(() => cloud.delete(`${test.api}/${jpgFileBody.id}`));

  it('should allow ping for googledrive', () => {
    return cloud.get(`/hubs/documents/ping`);
  });

  it('should allow CRD for hubs/documents/files and RU for hubs/documents/files/metadata by path', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      srcPath, destPath;
    return cloud.withOptions({ qs: { path: `/${faker.random.number()}`, overwrite: 'true' } }).postFile(`${test.api}`, UploadFile)
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}`, overwrite: true } }).post(`${test.api}/copy`, payload))
      .then(r => destPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/links`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).patch(`${test.api}/metadata`, updatePayload))
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).patch(`${test.api}/metadata/properties`, propertiesPayload))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).delete(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { path: `${destPath}` } }).delete(`${test.api}`));
  });

  it('should allow POST /files by providing folder id', () => {
    let folderId, fileId;
    return cloud.post('/folders', folderPayload)
      .then(r => folderId = r.body.id)
      .then(r => cloud.withOptions({ qs: {
          path: `/churros/brady-${faker.address.zipCode()}.jpg`,
          folderId,
          calculateFolderPath: false} }).postFile(test.api, `${__dirname}/../assets/brady.jpg`))
      .then(r => fileId = r.body.id)
      .then(() => cloud.delete(`${test.api}/${fileId}`))
      .then(() => cloud.delete(`/folders/${folderId}`));
  });

  it('should allow CRD for hubs/documents/files and RU for hubs/documents/files/metadata by id', () => {
    let UploadFile = __dirname + '/assets/Penguins.jpg',
      fileId, destPath;
    return cloud.withOptions({ qs: { path: `/${faker.random.number()}`, overwrite: 'true' } }).postFile(`${test.api}`, UploadFile)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get(`${test.api}/${fileId}`))
      .then(r => cloud.withOptions({ qs: { overwrite: true } }).post(`${test.api}/${fileId}/copy`, payload))
      .then(r => destPath = r.body.path)
      .then(r => cloud.get(`${test.api}/${fileId}/links`))
      .then(r => cloud.get(`${test.api}/${fileId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata`, updatePayload))
      .then(r => fileId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${fileId}/metadata/properties`, propertiesPayload))
      .then(r => cloud.delete(`${test.api}/${fileId}`))
      .then(r => cloud.withOptions({ qs: { path: `${destPath}` } }).delete(`${test.api}`));
  });

  it('should allow RS for documents/files/:id/revisions', () => {
      return cloud.get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
  });

  it('should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: query }).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: query }).get(`${test.api}/revisions/${revisionId}`));
  });

  //Test For Export Functionality
  it('should allow export of Google Doc to plain text using media type', () => {
    let DocFile = '/ChurrosDocDoNotDelete';
    return cloud.withOptions({ qs: { path: DocFile, mediaType: 'text/plain' } }).get(test.api)
      .then(r => {
        expect(r.body).to.contain('Sample Word Doc');
      });
  });
  it('should allow export of Google Sheets to csv using media type', () => {
    let SSFile = '/ChurrosSSDoNotDelete';
    return cloud.withOptions({ qs: { path: SSFile, mediaType: 'text/csv' } }).get(test.api)
      .then(r => {
        expect(r.body).to.contain('Test1,Test2,Tes3,Test4');
      });
  });
  it('should allow export of Google Presentations to text using media type', () => {
    let PPTFile = '/ChurrosPPTDoNotDelete';
    return cloud.withOptions({ qs: { path: PPTFile, mediaType: 'text/plain' } }).get(test.api)
      .then(r => {
        expect(r.body).to.contain('Churros PPT Test');
      });
  });
  it('should allow export of Google Drawing to pdf using media type', () => {
    let PNGFile = '/ChurrosPNGDoNotDelete';
    return cloud.withOptions({ qs: { path: PNGFile, mediaType: 'application/pdf' } }).get(test.api)
      .then(r => {
        expect(r.body).to.contain('%PDF-1.4');
      });
  });

  it('should fail when copying file to existing file path without overwrite', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/assets/Penguins.jpg';
    let query1 = { path: `/file-${faker.random.number()}.jpg` };
    let query2 = { path: `/file-${faker.random.number()}.jpg` };

    return cloud.withOptions({ qs: query1 }).postFile(`${test.api}`, path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile(`${test.api}`, path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: false } }).post(`${test.api}/copy`, { path: filePath2 }, r => { expect(r).to.have.statusCode(409); }))
      .then(r => cloud.get(`${test.api}/${fileId2}/metadata`))
      .then(r => { expect(r).to.have.statusCode(200) && expect(r.body.id).to.equal(fileId2); })
      .then(r => cloud.delete(`${test.api}/${fileId1}`))
      .then(r => cloud.delete(`${test.api}/${fileId2}`));
  });

  it('should succeed when copying file with existing file path with overwrite', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/assets/Penguins.jpg';
    let query1 = { path: `/file-${faker.random.number()}.jpg` };
    let query2 = { path: `/file-${faker.random.number()}.jpg` };

    return cloud.withOptions({ qs: query1 }).postFile(`${test.api}`, path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile(`${test.api}`, path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: true } }).post(`${test.api}/copy`, { path: filePath2 }))
      .then(r => { fileId2 = r.body.id; })
      .then(r => cloud.delete(`${test.api}/${fileId1}`))
      .then(r => cloud.delete(`${test.api}/${fileId2}`));
  });

  it(`should allow CRUDS for ${test.api}/:id/comments`, () => cloud.cruds(`${test.api}/${jpgFileBody.id}/comments`, commentPayload1));

  it(`should allow CRUDS for ${test.api}/comments by path`, () => cloud.withOptions({ qs: { path: jpgFileBody.path } }).cruds(`${test.api}/comments`, commentPayload1));

  it(`should allow paginating for ${test.api}/:id/comments`, () => {
    let commentId1, commentId2, nextPage;
    return cloud.post(`${test.api}/${jpgFileBody.id}/comments`, commentPayload1)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.post(`${test.api}/${jpgFileBody.id}/comments`, commentPayload2))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId2);
        expect(r.response.headers['elements-next-page-token']).to.exist;
        nextPage = r.response.headers['elements-next-page-token'];
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, nextPage } }).get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId1);
        expect(r.response.headers['elements-next-page-token']).to.not.exist;
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 2 } }).get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 3 } }).get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => expect(r.body).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${jpgFileBody.id}/comments/${commentId1}`))
      .then(r => cloud.delete(`${test.api}/${jpgFileBody.id}/comments/${commentId2}`));
  });

  it(`should allow paginating for ${test.api}/comments by path`, () => {
    let commentId1, commentId2, nextPage;
    return cloud.withOptions({ qs: { path: jpgFileBody.path } }).post(`${test.api}/comments`, commentPayload1)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.withOptions({ qs: { path: jpgFileBody.path } }).post(`${test.api}/comments`, commentPayload2))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId2);
        expect(r.response.headers['elements-next-page-token']).to.exist;
        nextPage = r.response.headers['elements-next-page-token'];
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, nextPage, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => {
        expect(r.body).to.have.lengthOf(1);
        expect(r.body[0].id).to.equal(commentId1);
        expect(r.response.headers['elements-next-page-token']).to.not.exist;
      })
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 2, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 3, path: jpgFileBody.path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.be.empty)
      .then(r => cloud.withOptions({ qs: { path: jpgFileBody.path } }).delete(`${test.api}/comments/${commentId1}`))
      .then(r => cloud.withOptions({ qs: { path: jpgFileBody.path } }).delete(`${test.api}/comments/${commentId2}`));
  });

  it(`should handle raw parameter for ${test.api}/comments`, () => {
    let commentId;
    return cloud.post(`${test.api}/${jpgFileBody.id}/comments`, commentPayload1)
      .then(r => commentId = r.body.id)
      .then(r => cloud.withOptions({ qs: { raw: true }}).get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${jpgFileBody.id}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${jpgFileBody.id}/comments/${commentId}`));
  });

  test
    .withApi('/files/comments')
    .withName(`should throw 404 when a junk path has been provided for /files/comments`)
    .withOptions({ qs: { path : '/whatever/junk/thing/is/possible.txt'}})
    .withValidation(r => expect(r).to.have.statusCode(404))
    .should.return200OnGet();

  it(`should allow POST /files/:id/thumbnails by providing folder id`, () => {
      const thumbnailFile = {
        "thumbnail": jpgFile
      };
      const files = {
        "file": textFile,
        "thumbnail": jpgFile
      };
          //if type of the file type is specified correctly, thumbnails generated by google have high priority
          //Therefore, we are uploading file with unknown type which returns null for thumbnailLink
       return cloud.withOptions({ qs: { path: `/testType1-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.gliffy` } }).postFile(test.api, textFile)
          .then(r => {
            textFileBody = r.body;
          // Since we provided unknown extension, Google Drive not able to generate thumnail. It's time to rock
            expect(r.body.properties.thumbnailLink).to.be.undefined;
          })
          .then(() => cloud.withOptions({ qs: { path: `/testType2-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.gliffy` } }).postFileMultiple(test.api, files))
          .then(r => {
            textFileBody2 = r.body;
            expect(r.body.properties.thumbnailLink).to.not.equal(null);
          })
          .then(() => cloud.postFileMultiple(`${test.api}/${textFileBody.id}/thumbnails`, thumbnailFile))
          .then(r => {
            expect(r.body.thumbnailLink).to.not.equal(null);
          })
          .then(() => cloud.withOptions({ qs: { path: textFileBody.path } }).postFileMultiple(`${test.api}/thumbnails`, thumbnailFile))
          .then(r => expect(r.body.thumbnailLink).to.not.equal(null))
          .then(() => cloud.delete(`${test.api}/${textFileBody.id}`))
          .then(() => cloud.delete(`${test.api}/${textFileBody2.id}`));
    });
});
