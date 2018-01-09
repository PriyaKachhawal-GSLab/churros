'use strict';

const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/users');

suite.forElement('collaboration', 'users', payload, (test) => {
  it(`should allow PATCH ${test.api}-active`, () => {
    return cloud.get(test.api)
      .then(r => cloud.patch(`${test.api}-active`));
  });
  test.withOptions({ qs: { 'where': `presence ='1'` } }).should.return200OnGet();
  test.should.supportPagination();

  /*  This test fails due to requirement of 'identity.basic' scope, that does not go with other scopes. */
  it.skip(`should allow GET ${test.api}-identity`, () => {
    return cloud.get(`${test.api}-identity`);
  });

  // test for patch /users-presence
  let userPresencePayload = {
    'presence': 'auto'
  };

  // test for patch /users-presence (fails randomly???)
  it.skip(`should allow PATCH ${test.api}-presence`, () => {
    return cloud.patch(`${test.api}-presence`, userPresencePayload);
  });

  // test for patch /users-profile
  let userProfilePayload = {
    'name': 'first_name',
    'value': tools.randomStr()
  };
  // test for patch /users-profile
  it(`should allow PATCH ${test.api}-profile`, () => {
    return cloud.patch(`${test.api}-profile`, userProfilePayload);
  });

  // test for get /users/messages
  it(`should allow GET ${test.api}/messages`, () => {
    return cloud.get(`${test.api}/messages`);
  });
  test.withApi(`${test.api}/messages`).withOptions({ qs: { 'group': true } }).should.return200OnGet();
  test.withApi(`${test.api}/messages`).should.supportPagination();

  // test for get /users/{userId} related apis
  it(`should allow SR for ${test.api} and presence/profile sub-resources`, () => {
    let userId;
    return cloud.get(test.api)
      .then(r => userId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${userId}`))
      .then(r => cloud.get(`${test.api}/${userId}/presence`))
      .then(r => cloud.get(`${test.api}/${userId}/profile`));
  });
});
