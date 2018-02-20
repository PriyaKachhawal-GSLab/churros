'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('crm', 'users', (test) => {
  it('should allow RS for /users', () => {
    let userId;
    return cloud.get(`${test.api}`)
      .then(r => {
        userId = r.body[0].id;
      })
      .then(r => cloud.withOptions({ qs: { where: 'FIRST_NAME=\'Developer\'' } }))
      .then(r => cloud.get(`${test.api}/${userId}`));
  });

  it('should allow S for /me', () => {
    return cloud.get(`${test.api}`);
  });
});