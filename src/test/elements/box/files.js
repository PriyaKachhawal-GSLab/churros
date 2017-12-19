'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const faker = require('faker');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customFields.json`);
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const lock = () => ({
  "is_download_prevented": false,
  "expires_at": "2030-12-12T10:55:30-08:00"
});



suite.forElement('documents', 'files', null, (test) => {
  afterEach(done => {
    //We were getting a 429 before this
    setTimeout(done, 2500);
  });
  it('should allow PUT /files/:id/lock and DELETE /files/:id/lock', () => {
    let fileId;
    let path = __dirname + '/../assets/brady.jpg';
    let query = { path: `/brady-${faker.address.zipCode()}.jpg` };
    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.put('/hubs/documents/files/' + fileId + '/lock', null, null, lock))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId + '/lock'))
      .then(r => cloud.delete(test.api + '/' + fileId));
  });

  it('should support links for files/:id/links without raw payload', () => {
    let fileId;
    let path = __dirname + '/../assets/brady.jpg';
    let query = { path: `/brady-${faker.address.zipCode()}.jpg` };
    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => fileId = r.body.id)
      .then(r => cloud.get("/hubs/documents/files/" + fileId + "/links"))
      .then(r => expect(r.body).to.not.contain.key('raw'))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId));
  });

  it('should support links for files/links with raw payload', () => {
    let fileId;
    let filePath;
    let path = __dirname + '/../assets/brady.jpg';
    let query = { path: `/brady-${faker.address.zipCode()}.jpg` };
    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => {
        fileId = r.body.id;
        filePath = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath, raw: true } }).get("/hubs/documents/files/links"))
      .then(r => expect(r.body).to.contain.key('raw'))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId));
  });

  it('should fail when copying file with existing file name', () => {
    let fileId1, fileId2, filePath1, filePath2;
    let path = __dirname + '/../assets/brady.jpg';
    let query1 = { path: `/brady-${faker.address.zipCode()}.jpg` };
    let query2 = { path: `/brady-${faker.address.zipCode()}.jpg` };

    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => {
        fileId1 = r.body.id;
        filePath1 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: query2 }).postFile('/hubs/documents/files', path))
      .then(r => {
        fileId2 = r.body.id;
        filePath2 = r.body.path;
      })
      .then(r => cloud.withOptions({ qs: { path: filePath1, overwrite: false } }).post('/hubs/documents/files/copy', { path: filePath2 }, r => { expect(r).to.have.statusCode(409); }))
      .then(r => cloud.get(`/hubs/documents/files/${fileId2}/metadata`))
      .then(r => { expect(r).to.have.statusCode(200) && expect(r.body.id).to.equal(fileId2); })
      .then(r => cloud.delete('/hubs/documents/files/' + fileId1))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId2));
  });


  it('should support CRUDS for /files/:id/custom-fields', () => {
    let fileId1, tempKey;
    let updatePayload = {
      "template": "customer",
      "path": "/" + temPayload.fields[0].key,
      "value": "madhuri",
      "scope": "enterprise"
    };

    let path = __dirname + '/../assets/brady.jpg';
    let query1 = { path: `/brady-${faker.address.zipCode()}.jpg` };
    return cloud.withOptions({ qs: query1 }).postFile('/hubs/documents/files', path)
      .then(r => fileId1 = r.body.id)
      .then(r => cloud.post('/hubs/documents/custom-fields/templates', temPayload))
      .then(r => {
        tempKey = r.body.templateKey;
        updatePayload.template = r.body.templateKey;
		payload.template = r.body.templateKey;	
      })
      .then(r => cloud.get(`/hubs/documents/files/${fileId1}/custom-fields`))
      .then(r => cloud.post(`/hubs/documents/files/${fileId1}/custom-fields`, payload))
      .then(r => cloud.put(`/hubs/documents/files/${fileId1}/custom-fields`, updatePayload))
      .then(r => cloud.patch(`/hubs/documents/files/${fileId1}/custom-fields`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`/hubs/documents/files/${fileId1}/custom-fields/${tempKey}`))
      .then(r => cloud.patch(`/hubs/documents/files/${fileId1}/custom-fields/${tempKey}`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).delete(`/hubs/documents/files/${fileId1}/custom-fields/${tempKey}`))
      .then(r => cloud.delete('/hubs/documents/files/' + fileId1));

  });

});
