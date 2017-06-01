'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('documents', 'folders', null, (test) => {

  it('should allow GET /folders/metadata for root folder by path & ID', () => {
    let rootPath = "/";
    let memberId = "developer@cloud-elements.com";
    let query = { path: rootPath };
    return cloud.withOptions({ qs: query, headers: { "Elements-As-Team-Member": memberId } }).get("/hubs/documents/folders/metadata")
      .then(r => encodeURIComponent(r.body.id))
      .then(r => cloud.get(`/hubs/documents/folders/${r}/metadata`))
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.path).to.equal(rootPath);
        expect(r.body.directory).to.equal(true);
      })
  });
});
