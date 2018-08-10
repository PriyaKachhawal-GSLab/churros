'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const faker = require('faker');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customFields.json`);
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const templateKeyPayload = tools.requirePayload(`${__dirname}/assets/UpdateCustomFields.json`);
const commentPayload1 = tools.requirePayload(`${__dirname}/assets/comment.json`);
const commentPayload2 = tools.requirePayload(`${__dirname}/assets/comment.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/PutCustomFields.json`);
const folderPayload = require('./assets/folders');

const randomInt = tools.randomInt();
folderPayload.path += randomInt;
folderPayload.name += randomInt;

const lock = {
  "is_download_prevented": false,
  "expires_at": "2030-12-12T10:55:30-08:00"
};

suite.forElement('documents', 'files', (test) => {
  let id, path, name, fileTagPayload, fileUpdateTagPayload, templateKey;
  let file = `${__dirname}/assets/brady.jpg`;

  before(done => {
    return cloud.withOptions({ qs: { path: `/brady-${faker.address.zipCode()}.jpg` } }).postFile(test.api, `${__dirname}/assets/brady.jpg`)
      .then(r => {
        id = r.body.id;
        path = r.body.path;
        name = r.body.name;
        fileTagPayload = r.body;
        fileTagPayload.tags = ["fileTag1", "fileTag2"];
      })
      .then(r =>  cloud.post(`/custom-fields-templates`, temPayload))
          .then(r => {
        templateKey = r.body.templateKey;
        payload.template = r.body.templateKey;
        updatePayload.template= r.body.templateKey;
        updatePayload.path = "/" + r.body.fields[0].key;
        templateKeyPayload.path= "/" + r.body.fields[0].key;
          })
          .then(r => done());
  });
  
  after(() => cloud.delete(`${test.api}/${id}`)
    .then(() => cloud.withOptions({ qs: {scope: "enterprise"}}).delete(`/custom-fields-templates/${templateKey}`))
  );
  
  afterEach(done => {
    // To avoid 429 rate limiting
    setTimeout(done, 2500);
  });


  it('should allow CRD /files and RD /files/:id', () => {
    let pathFile,
        query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };
    return cloud.get(`/hubs/documents/files/${id}`)
      .then(() => cloud.withOptions({ qs: Object.assign({}, { path: `${query.path}-ayy` }) }).postFile('/hubs/documents/files', file))
      .then(r => pathFile = r.body)
      .then(() => cloud.withOptions({ qs: { path: pathFile.path } }).get('/hubs/documents/files'))
      .then(r => cloud.withOptions({ qs: { path: pathFile.path } }).delete('/hubs/documents/files'));
  });

  it('should allow GET /files/links and /files/:id/links', () => {
    return cloud.get(`/hubs/documents/files/${id}/links`)
      .then(() => cloud.withOptions({ qs: { path: path } }).get('/hubs/documents/files/links'));
  });

  it('should allow RU /files/metadata and RU /files/:id/metadata', () => {
    let updatedFile,
      fileTemp = { path: `/a-${name}` };
    return cloud.withOptions({ qs: { path: path } }).get('/hubs/documents/files/metadata')
      .then(r => cloud.withOptions({ qs: { path: path } }).patch('/hubs/documents/files/metadata', fileTemp))
      .then(r => updatedFile = r.body)
      .then(r => cloud.patch(`/hubs/documents/files/${updatedFile.id}/metadata`, fileTagPayload))
      .then(r => cloud.get(`/hubs/documents/files/${id}/metadata`));
  });

  it('should allow POST /files/copy and POST /files/:id/copy', () => {
    const copy1 = { path: '/churrosCopy1' + tools.random() },
      copy2 = { path: '/churrosCopy2' + tools.random() };
    let fileCopy1, fileCopy2;
    return cloud.withOptions({ qs: { path: path } }).post('/hubs/documents/files/copy', copy1)
      .then(r => fileCopy1 = r.body)
      .then(() => cloud.withOptions({ qs: { path: path } }).post('/hubs/documents/files/copy', copy2))
      .then(r => fileCopy2 = r.body)
      .then(() => cloud.delete(`/hubs/documents/files/${fileCopy1.id}`))
      .then(() => cloud.delete(`/hubs/documents/files/${fileCopy2.id}`));
  });
  it('should allow POST /files by providing folder id', () => {
    let folderId, fileId;
    return cloud.post('/folders', folderPayload)
      .then(r => folderId = r.body.id)
      .then(r => cloud.withOptions({
        qs: {
          path: `/churros/brady-${faker.address.zipCode()}.jpg`,
          folderId,
          calculateFolderPath: false
        }
      }).postFile(test.api, `${__dirname}/../assets/brady.jpg`))
      .then(r => fileId = r.body.id)
      .then(() => cloud.delete(`${test.api}/${fileId}`))
      .then(() => cloud.delete(`/folders/${folderId}`));
  });

  it('should allow PUT /files/:id/lock and DELETE /files/:id/lock', () => {
    return cloud.put(`${test.api}/${id}/lock`, null, null, lock)
      .then(r => cloud.delete(`${test.api}/${id}/lock`));
  });

  it('should allow links for files/:id/links without raw payload', () => {
    return cloud.get(`${test.api}/${id}/links`)
      .then(r => expect(r.body).to.not.contain.key('raw'));
  });

  it('should allow links for files/links with raw payload', () => {
    return cloud.withOptions({ qs: { path: path, raw: true } }).get(`${test.api}/links`)
      .then(r => expect(r.body).to.contain.key('raw'));
  });

  it('should fail when copying file with existing file name', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/../assets/brady.jpg';
    let query1 = { path: `/brady-${faker.address.zipCode()}.jpg` };
    let query2 = { path: `/brady-${faker.address.zipCode()}.jpg` };

    return cloud.withOptions({ qs: query1 }).postFile(test.api, path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile(test.api, path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: false } }).post('/hubs/documents/files/copy', { path: filePath2 }, r => { expect(r).to.have.statusCode(409); }))
      .then(r => cloud.get(`/hubs/documents/files/${fileId2}/metadata`))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body.id).to.equal(fileId2))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId1))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId2));
  });


  it('should allow CRUDS for /files/:id/custom-fields', () => {
      return cloud.get(`/hubs/documents/files/${id}/custom-fields`)
      .then(r => cloud.post(`/hubs/documents/files/${id}/custom-fields`, payload))
      .then(r => cloud.put(`/hubs/documents/files/${id}/custom-fields`, updatePayload))
      .then(r => cloud.patch(`/hubs/documents/files/${id}/custom-fields`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`/hubs/documents/files/${id}/custom-fields/${templateKey}`))
      .then(r => cloud.patch(`/hubs/documents/files/${id}/custom-fields/${templateKey}`, templateKeyPayload));
  });

  it('should allow RUD for /files/{id}/custom-fields-templates/{templateKeyId}/custom-fields', () => {
      return cloud.withOptions({ qs: { scope: "enterprise" } }).get(`/hubs/documents/files/${id}/custom-fields-templates/${templateKey}/custom-fields`)
      .then(r => cloud.patch(`/hubs/documents/files/${id}/custom-fields-templates/${templateKey}/custom-fields`, templateKeyPayload));
  });


  /**
   * /files/revisions endpoint doesn't return current revision.
   * While we don't offer the POST /revisions endpoint we'll need to hardcode the file data
   */
  it('should allow RS for documents/files/:id/revisions', () => {
    const fileId = 310815318732;
    let revisionId;
    return cloud.get(`${test.api}/${fileId}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.get(`${test.api}/${fileId}/revisions/${revisionId}`));
  });

  it('should allow RS for documents/files/revisions by path', () => {
    let options = { qs: { path: '/ChurrosRevisionsAPIDontDelete/revisionstestfile.txt' } };
    let revisionId;
    return cloud.withOptions(options).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions(options).get(`${test.api}/revisions/${revisionId}`));
  });

  it(`should allow CRUDS for ${test.api}/:id/comments`, () => cloud.cruds(`${test.api}/${id}/comments`, commentPayload1));

  it(`should allow CRUDS for ${test.api}/comments by path`, () => cloud.withOptions({ qs: { path } }).cruds(`${test.api}/comments`, commentPayload1));

  it(`should allow paginating for ${test.api}/:id/comments`, () => {
    let commentId1, commentId2;
    return cloud.post(`${test.api}/${id}/comments`, commentPayload1)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.post(`${test.api}/${id}/comments`, commentPayload2))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 2 } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 3 } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${id}/comments/${commentId1}`))
      .then(r => cloud.delete(`${test.api}/${id}/comments/${commentId2}`));
  });

  it(`should allow paginating for ${test.api}/comments by path`, () => {
    let commentId1, commentId2;
    return cloud.withOptions({ qs: { path } }).post(`${test.api}/comments`, commentPayload1)
      .then(r => commentId1 = r.body.id)
      .then(r => cloud.withOptions({ qs: { path } }).post(`${test.api}/comments`, commentPayload2))
      .then(r => commentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1, path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId1))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 2, path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].id).to.equal(commentId2))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 3, path } }).get(`${test.api}/comments`))
      .then(r => expect(r.body).to.be.empty)
      .then(r => cloud.withOptions({ qs: { path } }).delete(`${test.api}/comments/${commentId1}`))
      .then(r => cloud.withOptions({ qs: { path } }).delete(`${test.api}/comments/${commentId2}`));
  });

  it(`should handle raw parameter for ${test.api}/comments`, () => {
    let commentId;
    return cloud.post(`${test.api}/${id}/comments`, commentPayload1)
      .then(r => commentId = r.body.id)
      .then(r => cloud.withOptions({ qs: { raw: true } }).get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}/comments`))
      .then(r => expect(r.body.filter(obj => obj.raw)).to.be.empty)
      .then(r => cloud.delete(`${test.api}/${id}/comments/${commentId}`));
  });

  it('should allow UR tags /files/metadata by path', () => {
    return cloud.withOptions({ qs: { path: fileTagPayload.path } }).patch(`${test.api}/metadata`, fileTagPayload)
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${fileTagPayload.tags[0]}`);
        fileUpdateTagPayload = r.body;
        fileUpdateTagPayload.tags = ["fileTag1Updated", "fileTag2Updated"];
      })
      .then(() => cloud.withOptions({ qs: { path: fileTagPayload.path } }).get(`${test.api}/metadata`))
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${fileTagPayload.tags[0]}`);
      });
  });

  it('should allow UR tags /folders/:id/metadata', () => {
    return cloud.patch(`${test.api}/${fileUpdateTagPayload.id}/metadata`, fileUpdateTagPayload)
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${fileUpdateTagPayload.tags[0]}`);
      })
      .then(() => cloud.get(`${test.api}/${fileUpdateTagPayload.id}/metadata`))
      .then(r => {
        expect(r.body.tags[0]).to.equal(`${fileUpdateTagPayload.tags[0]}`);
      });
  });
});
