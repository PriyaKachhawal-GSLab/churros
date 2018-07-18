'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('social', 'user', null, (test) => {
  let userId;
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

  it('should allow GET for hubs/social/user/{id}/photos ', () => {
    return cloud.withOptions({ qs: { type:'uploaded' } }).get(`${test.api}/${userId}/photos`)
      .then(r => cloud.withOptions({ qs: { type:'uploaded', page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/photos`));
  });

  it('should allow GET for hubs/social/user/{id}/videos ', () => {
    return cloud.withOptions({ qs: { type:'uploaded' } }).get(`${test.api}/${userId}/videos`)
      .then(r => cloud.withOptions({ qs: { type:'uploaded', page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/videos`));
  });

  it('should allow GET for hubs/social/user/{id}/likes ', () => {
    return cloud.get(`${test.api}/${userId}/likes`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/likes`));
  });

  it('should allow GET for hubs/social/user/{id}/status ', () => {
    return cloud.get(`${test.api}/${userId}/status`)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${userId}/status`));
  });

});
