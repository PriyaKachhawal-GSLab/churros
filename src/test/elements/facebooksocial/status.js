'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('social', 'status', null, (test) => {
  let userId, photoId;
  it(`should allow GET user/{id}/photos`, () => {
    cloud.get(`user/me`)
      .then(r => userId = r.body.id)
      .then(r => cloud.get(`user/${userId}/photos`))
      .then(r => photoId = r.body[0].id);
  });
  
  test.should.supportSr();
  test.should.supportPagination();
});
