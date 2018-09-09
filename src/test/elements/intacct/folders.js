'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

const foldersPayload = tools.requirePayload(`${__dirname}/assets/folders-create.json`);
const foldersPatchPayload = tools.requirePayload(`${__dirname}/assets/folders-update.json`);
const filesCreatePayload = tools.requirePayload(`${__dirname}/assets/files-create.json`);
const filesUpdatePayload = tools.requirePayload(`${__dirname}/assets/files-update.json`);


suite.forElement('finance', 'folders', { payload: foldersPayload }, (test) => {

  let beforeFoldersPayload = {
    "folderName": tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)
  };
  let folderName = beforeFoldersPayload.folderName;
  let beforeFoldersPayload1 = {
    "folderName":  tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)
  };
  let fileFolderName = beforeFoldersPayload1.folderName;
  before(() => {
    cloud.post(`${test.api}`, beforeFoldersPayload);
    cloud.post(`${test.api}`, beforeFoldersPayload1);
  });

    after(() => {
      cloud.delete(`${test.api}/${folderName}`);
      cloud.delete(`${test.api}/${fileFolderName}`);
    });


  it(`should allow CRUDS for ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => cloud.post(`${test.api}`, foldersPayload))
      .then(r => cloud.get(`${test.api}/${folderName}`))
      .then(r => cloud.patch(`${test.api}/${folderName}`, foldersPatchPayload))
      .then(r => cloud.delete(`${test.api}/${folderName}`));
  });
  test.should.supportPagination();
  test.withName('should support description = {string} Ceql search')
    .withOptions({ qs: { where: 'description=\'churros test case\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.description = 'churros test case');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  it(`should allow CRUDS for ${test.api}/${folderName}/files`, () => {
    let supdocId = 999999;
    return cloud.post(`${test.api}/${fileFolderName}/files`, filesCreatePayload)
      .then(r => cloud.get(`${test.api}/${fileFolderName}/files`))
      .then(r => supdocId = r.body[0].supdocid)
      .then(r => cloud.patch(`${test.api}/${fileFolderName}/files/${supdocId}`, filesUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${fileFolderName}/files/${supdocId}`));
  });
  test.withApi(`${test.api}/${fileFolderName}/files`).should.supportPagination();
  test.withApi(`${test.api}/${fileFolderName}/files`).withName('should support  description = {string} Ceql search')
    .withOptions({ qs: { where: 'description=\'Test\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.description = 'Test');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
