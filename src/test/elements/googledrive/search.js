'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const folderPayload = { path: '/entirely-new-folder' };

suite.forElement('documents', 'search', null, (test) => {


  let date1, date2;

  before(done => {
    // GDrive needs some time to process deleting files in a previous test :[
    setTimeout(done, 2000);
  });


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
      .then(r => cloud.withOptions({ qs: { calculateFolderPath: true, path: folderPayload.path } }).get(test.api))
      .then(r => expect(r.body).to.have.lengthOf(1) && expect(r.body[0].path).to.equal(folder.path))
      .then(r => cloud.withOptions({ qs: { calculateFolderPath: false, path: folderPayload.path, text: 'test' } }).get(test.api))
      .then(r => expect(r.body).to.not.be.empty && expect(r.body.filter(obj => obj.path)).to.be.empty && expect(r.body.filter(obj => obj.name.toLowerCase().includes('test'))).to.have.lengthOf(r.body.length))
      .then(r => cloud.delete(`/folders/${folder.id}`));
  });

  test.withApi(test.api)
    .withName(`should allow GET for /search  with orderBy createdDate asc`)
    .withOptions({ qs: { pageSize: 5, page: 1, orderBy: `createdDate asc`, calculateFolderPath: false } })
    .withValidation(r => {
      date1 = new Date(r.body[0].createdDate).getTime();
      date2 = new Date(r.body[1].createdDate).getTime();
      expect(date1 <= date2).to.be.true;
    })
    .should.return200OnGet();

  test.withApi(test.api)
    .withName(`should allow GET for /search  with orderBy createdDate desc`)
    .withOptions({ qs: { pageSize: 5, page: 1, orderBy: `createdDate desc`, calculateFolderPath: false } })
    .withValidation(r => {
      date1 = new Date(r.body[0].createdDate).getTime();
      date2 = new Date(r.body[1].createdDate).getTime();
      expect(date1 >= date2).to.be.true;
    })
    .should.return200OnGet();

  // GDrive needs some time to process deleting files in a previous test :[

  test.should.supportPagination('id');

  test.should.supportNextPagePagination(1);
});
