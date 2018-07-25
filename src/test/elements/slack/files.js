'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const commentPayload = require('./assets/comment');

suite.forElement('collaboration', 'files', (test) => {
  let fileId;
  let fileNameOptions = {
    formData: {
      channels: 'random'
    }
  };
  before(() => cloud.withOptions(fileNameOptions).postFile(test.api, `${__dirname}/assets/zfile.png`)
    .then(r => fileId = r.body.id));

  after(() => cloud.delete(`${test.api}/${fileId}`));

  //Test for get files
  test.withOptions({ qs: { 'where': 'types = \'images\'' } }).should.return200OnGet();
  test.should.supportPagination('id');

  it(`should allow RETRIEVE ${test.api}/contents`, () => {
    let fileid;
    return cloud.get(test.api)
      .then(r => fileid = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${fileid}/contents`));
  });

  //test for CRD operations on files
  it(`should allow SR ${test.api}`, () => {
    let fileid;
    return cloud.get(test.api)
      .then(r => fileid = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${fileid}`));
  });

  // Tests for actions on 'files'
  let fileActionPayload = [
    { 'action': 'share' },
    { 'action': 'revoke' }
  ];

  it(`should allow PATCH ${test.api}/:fileId/actions`, () => {
    let fileid;
    return cloud.get(test.api)
      .then(r => fileid = r.body[0].id)
      .then(r => fileActionPayload.forEach(fAction => cloud.patch(`${test.api}/${fileid}/actions`, fAction)));
  });

  it(`should allow CUD ${test.api}/:fileId/comment`, () => {
    let fileCommentUpdatePayload = {
      'comment': 'Updated Comment'
    };
    let commentId;
    return cloud.post(`${test.api}/${fileId}/comment`, commentPayload)
      .then(r => commentId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${fileId}/comment/${commentId}`, fileCommentUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${fileId}/comment/${commentId}`));
  });

});
