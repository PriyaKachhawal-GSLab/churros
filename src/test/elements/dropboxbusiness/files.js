'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const props = require('core/props');
const tools = require('core/tools');

suite.forElement('documents', 'files', (test) => {

  let jpgFile = __dirname + '/assets/brady.jpg';
  var jpgFileBody,revisionId;
  let memberId = props.getForKey('dropboxbusiness', 'username');
  let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };

  before(() => cloud.withOptions({ qs : query , headers: { "Elements-As-Team-Member": memberId }}).postFile(test.api, jpgFile)
  .then(r => jpgFileBody = r.body));

  after(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`${test.api}/${jpgFileBody.id}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
      return cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: query , headers: { "Elements-As-Team-Member": memberId }}).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: query , headers: { "Elements-As-Team-Member": memberId }}).get(`${test.api}/revisions/${revisionId}`));
  });

});
