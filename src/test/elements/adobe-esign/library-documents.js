'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

/* jshint unused:false */
const createLibraryDocuments = (transientDocumentId) => ({
  "libraryDocumentCreationInfo": {
    "libraryTemplateTypes": "DOCUMENT",
    "fileInfos": [{
      "transientDocumentId": transientDocumentId
    }],
    "name": tools.random(),
    "librarySharingMode": "USER"
  },
  "options": {
    "noChrome": false,
    "authoringRequested": false,
    "autoLoginUser": false
  }
});

suite.forElement('esignature', 'library-documents', (test) => {
  /*
  // Commented the POST for this resource to avoid creation of new Library Documents, since the code
  // might break for GET /libraryDocuments due to time-out. Also there is no DELETE API for libraryDocuments
    it(`should allow POST for ${test.api}`, () => {
    return cloud.postFile('/hubs/esignature/transientDocuments', __dirname + '/assets/attach.txt')
      .then(r => transientDocumentId = r.body.id)
      .then(r => cloud.post(test.api, createLibraryDocuments(transientDocumentId)));
    });
  */
  /*
  //Commented out this block to avoid all posts, instead hardcoded the libraryDocumentId of a Library Document
  //in the Adobe Esign UI named "DoNotDeleteThisLibraryDocumentThisIsForChurrosTesting".
    let transientDocumentId, libraryDocumentId;
    before(() => cloud.postFile(`/hubs/esignature/transient-documents`, `${__dirname}/assets/attach.txt`)
      .then(r => transientDocumentId = r.body.id)
      .then(r => cloud.post(test.api, createLibraryDocuments(transientDocumentId)))
      .then(r => libraryDocumentId = r.body.id))
  */
  let libraryDocumentId = "3AAABLblqZhClHK1fioPebGw8EMx-PrHOTwkxSZMn6hfb0y3T95CA9ScNV7XZytrJM2gHPHMR0DgdY3simUO62FIYJnetl25d";

  test.should.return200OnGet();
  it(`should allow GET for ${test.api}/{libraryDocumentId}`, () => {
    return cloud.get(`${test.api}/${libraryDocumentId}`);
  });
  it(`should allow GET for ${test.api}/{libraryDocumentId}/audits`, () => {
    return cloud.get(`${test.api}/${libraryDocumentId}/audits`);
  });
  it(`should allow GET ${test.api}/{libraryDocumentId}/combined-documents`, () => {
    return cloud.get(`${test.api}/${libraryDocumentId}/combined-documents`);
  });
  it(`should allow GET ${test.api}/{libraryDocumentId}/documents`, () => {
    return cloud.get(`${test.api}/${libraryDocumentId}/documents`);
  });
  it(`should allow GET ${test.api}/{libraryDocumentId}/documents/{documentId}`, () => {
    let documentId;
    return cloud.get(`${test.api}/${libraryDocumentId}/documents`)
      .then(r => documentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${libraryDocumentId}/documents/${documentId}`));
  });
});
