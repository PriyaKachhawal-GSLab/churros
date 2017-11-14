'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/status.json`);
const comments = tools.requirePayload(`${__dirname}/assets/statusComments.json`);

suite.forElement('social', 'status', { payload: payload }, (test) => {
  let userId, photoId;
  it(`should allow GET user/{id}/photos`, () => {
    cloud.get(`user/me`)
      .then(r => userId = r.body.id)
      .then(r => cloud.get(`user/${userId}/photos`))
      .then(r => photoId = r.body[0].id);
  });
  payload.object_attachment = photoId;

  test.should.supportCrds();
  test.should.supportPagination();

  it('should allow POST and DELETE likes', () => {
    let pageId,accessToken,statusId,commentId;
    return cloud.get(`/hubs/social/pages`)
      .then(r => pageId = r.body[0].id)
      .then(r => cloud.get(`/hubs/social/pages/${pageId}/page-access-token`))
      .then(r => accessToken = r.body.access_token)
      .then(r => cloud.post(`/hubs/social/user/${pageId}/status`,payload))
      .then(r => statusId = r.body.id)
      .then(r => cloud.withOptions({ qs: {pageToken: accessToken } }).post(`/hubs/social/status/${statusId}/like`))
      .then(r => cloud.withOptions({ qs: {pageToken: accessToken } }).post(`/hubs/social/status/${statusId}/comments`,comments))
      .then(r => commentId = r.body.id)
      .then(r => cloud.withOptions({ qs: {pageToken: accessToken } }).delete(`/hubs/social/user/comment/${commentId}`))
      .then(r => cloud.withOptions({ qs: {pageToken: accessToken } }).delete(`/hubs/social/user/likes/${statusId}`));
  });
});
