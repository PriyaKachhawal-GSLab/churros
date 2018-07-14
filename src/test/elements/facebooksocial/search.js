'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('social', 'search', null, (test) => {
  it('should allow GET for hubs/social/status and then comments and likes by statusId ', () => {
    let statusId;
    return cloud.get('/hubs/social/status')
      .then(r => statusId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${statusId}/comments`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${statusId}/comments`))
      .then(r => cloud.get(`${test.api}/${statusId}/likes`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${statusId}/likes`));
  });
});
