'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const queryParam = tools.requirePayload(`${__dirname}/assets/files-requiredQueryParam-c.json`);
const query = tools.requirePayload(`${__dirname}/assets/filesRevisions-requiredQueryParam-r.json`);
const queryPayload = tools.requirePayload(`${__dirname}/assets/filesLinks-requiredQueryParam-rd.json`);

suite.forElement('documents', 'files', (test) => {

  let jpgFile = __dirname + '/assets/brady.jpg';
  var jpgFileBody,revisionId;

  before(() => cloud.withOptions({ qs : queryParam }).postFile(test.api, jpgFile)
  .then(r => {jpgFileBody = r.body;
query.path = r.body.path;
  }));

  after(() => cloud.delete(`${test.api}/${jpgFileBody.id}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
      return cloud.get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: query }).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: query }).get(`${test.api}/revisions/${revisionId}`));
  });

  it('it should allow D for documents/files/{id}/links', () => {
       return cloud.get(`${test.api}/${jpgFileBody.id}/links`)
       .then(() => cloud.delete(`${test.api}/${jpgFileBody.id}/links`));
   });

   it('it should allow D for documents/files/links', () => {
       //var filePath = jpgFileBody.path;
       queryPayload.path = jpgFileBody.path;
       return cloud.get(`${test.api}/${jpgFileBody.id}/links`)
      .then(() => cloud.withOptions({ qs: queryPayload }).delete(`${test.api}/links`));
  });
});
