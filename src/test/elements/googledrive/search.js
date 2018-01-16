'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const folderPayload = { path: '/entirely-new-folder' };

suite.forElement('documents', 'search', null, (test) => {
  test.withOptions({ qs: { text: tools.random() } }).should.return200OnGet();

  test
    .withName(`should not support searching more than 1000 records`)
    .withOptions({ qs: { pageSize: 2, page: 501 } })
    .withValidation((r) => expect(r).to.have.statusCode(200))
    .should.return200OnGet();

  it('should not return more than my folder on a GET /search', () => {
    let folder;
    return cloud.post('/folders', folderPayload)
      .then(r => folder = r.body)
      .then(r => cloud.withOptions({ qs: { calculateFolderPath: false, path: folderPayload.path } }).get(test.api))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].path).to.equal(folder.path))
      .then(r => cloud.delete(`/folders/${folder.id}`));
  });

  // GDrive needs some time to process deleting files in a previous test :[
  test.should.supportPagination('id');
});
