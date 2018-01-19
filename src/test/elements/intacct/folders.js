'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const foldersPayload = tools.requirePayload(`${__dirname}/assets/folders.json`);
const foldersPatchPayload = tools.requirePayload(`${__dirname}/assets/foldersPatch.json`);
const filesPayload = tools.requirePayload(`${__dirname}/assets/files.json`);


suite.forElement('finance', 'folders', { payload: foldersPayload }, (test) => {
  it(`should allow CRUDS for ${test.api}`, () => {
    let docid;
    return cloud.get(test.api)
      .then(r => docid = r.body[0].id)
      .then(r => cloud.post(`${test.api}`, foldersPayload))
      .then(r => cloud.get(`${test.api}/${docid}`))
      .then(r => cloud.patch(`${test.api}/${docid}`, foldersPatchPayload))
      .then(r => cloud.delete(`${test.api}/${docid}`));
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

  let folderName = "churrosFolder",
    supdocId = 999999;
  before(() => {
    let beforeFoldersPayload = {
      "folderName": "churrosFolder"
    };
    cloud.post(`${test.api}`, beforeFoldersPayload);
  });

  after(() => {
    cloud.delete(`${test.api}/${folderName}`);
  });

  it(`should allow CRUDS for ${test.api}/{folderName}/files`, () => {
    let filesPatchPayload = {
      "description": "Churros update"
    };

    return cloud.post(`${test.api}/${folderName}/files`, filesPayload)
      .then(r => cloud.get(`${test.api}/${folderName}/files`))
      .then(r => supdocId = r.body[0].supdocid)
      .then(r => cloud.patch(`${test.api}/${folderName}/files/${supdocId}`, filesPatchPayload))
      .then(r => cloud.delete(`${test.api}/${folderName}/files/${supdocId}`));
  });
  test.withApi(`${test.api}/${folderName}/files`).should.supportPagination();
  test.withApi(`${test.api}/${folderName}/files`).withName('should support  description = {string} Ceql search')
    .withOptions({ qs: { where: 'description=\'Test\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.description = 'Test');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
