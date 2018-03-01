'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('crm', 'users', (test) => {
  it('should allow RS for /users', () => {
    let userId;
    return cloud.get(`${test.api}`)
      .then(r => {
        userId = r.body[0].id;
      })
      .then(r => cloud.withOptions({ qs: { where: 'updated_after_utc=\'2018-02-05 17:20:45\'' } }))
      .then(r => cloud.get(`${test.api}/${userId}`))
      .then(r => expect(r.body).to.not.be.empty);
  });

  it('should allow S for /me', () => {
    return cloud.get(`${test.api}`);
  });
});