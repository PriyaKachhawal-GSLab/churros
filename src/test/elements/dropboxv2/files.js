'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');

suite.forElement('documents', 'files', (test) => {

  let jpgFile = __dirname + '/assets/brady.jpg';
  var jpgFileBody,revisionId;
  let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };

  before(() => cloud.withOptions({ qs : query }).postFile(test.api, jpgFile)
  .then(r => jpgFileBody = r.body));

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
       var filePath = jpgFileBody.path;
       return cloud.get(`${test.api}/${jpgFileBody.id}/links`)
      .then(() => cloud.withOptions({ qs: { path: filePath  } }).delete(`${test.api}/links`));
  });
});
