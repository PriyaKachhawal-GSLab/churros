'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/files.json`);

suite.forElement('documents', 'files', { payload: payload }, (test) => {
  let jpgFile = __dirname + '/assets/Penguins.jpg';
  var jpgFileBody,revisionId;
  let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` , overwrite: 'true', size: '777835'};

  before(() => cloud.withOptions({ qs : query }).postFile(test.api, jpgFile)
  .then(() => cloud.withOptions({ qs : query }).postFile(test.api, jpgFile))
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

});
