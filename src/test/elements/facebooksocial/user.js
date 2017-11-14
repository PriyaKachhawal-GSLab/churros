'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/status.json`);

suite.forElement('social', 'user',{ payload:payload }, (test) => {
  let userId,statusId;
  it('should allow GET for hubs/social/user/me and GET user by id ', () => {
    return cloud.get(`${test.api}/me`)
      .then(r => userId = r.body.id)
      .then(r =>cloud.get(`${test.api}/${userId}`));
  });

  it('should allow GET for hubs/social/user/me/friends and  hubs/social/user/me/permissions ', () => {
    return cloud.get(`${test.api}/me/friends`)
      .then(r =>cloud.get(`${test.api}/me/permissions`));
  });

  it('should allow GET for hubs/social/user/{id}/friends and  hubs/social/user/{id}/accounts ', () => {
    return cloud.get(`${test.api}/${userId}/friends`)
      .then(r =>cloud.get(`${test.api}/${userId}/accounts`));
  });

  it('should allow CRD for hubs/social/user/{id}/photos ', () => {
    let path = __dirname + '/assets/temp.jpg';
    let photoId;
    return cloud.withOptions({ qs: { type:'uploaded' } }).get(`${test.api}/${userId}/photos`)
      .then(r => cloud.withOptions({ qs: { type:'uploaded', page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/photos`))
      .then(r => cloud.withOptions({ qs: { caption:'sample' } }).postFile(`${test.api}/${userId}/photos`, path))
      .then(r => photoId = r.body.id)
      .then(r =>cloud.delete(`${test.api}/photo/${photoId}`));
  });

  it('should allow CRD for hubs/social/user/{id}/videos ', () => {
    let path = __dirname + '/assets/temp.3gp';
    let videoId;
    return cloud.withOptions({ qs: { type:'uploaded' } }).get(`${test.api}/${userId}/videos`)
      .then(r => cloud.withOptions({ qs: { type:'uploaded', page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/videos`))
      .then(r => cloud.withOptions({ qs: { title:'sample' } }).postFile(`${test.api}/${userId}/videos`, path))
      .then(r => videoId = r.body.id)
      .then(r =>cloud.delete(`${test.api}/video/${videoId}`));
  });

  it('should allow GET for hubs/social/user/{id}/likes ', () => {
    return cloud.get(`${test.api}/${userId}/likes`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/likes`));
  });

  it('should allow Cr for hubs/social/user/{id}/status ', () => {
    return cloud.get(`${test.api}/${userId}/status`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/status`))
      .then(r =>cloud.post(`${test.api}/${userId}/status`,payload))
      .then(r => statusId = r.body.id);
  });
  it('should allow GET for hubs/social/user/context/{id}', () => {
    let contextId;
    return cloud.get(`${test.api}/me`)
      .then(r => contextId = r.body.context.id)
      .then(r =>cloud.get(`${test.api}/context/${contextId}`));
  });
});
