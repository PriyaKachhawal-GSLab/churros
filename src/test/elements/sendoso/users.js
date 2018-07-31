'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const userCreatePayload = tools.requirePayload(`${__dirname}/assets/userCreate.json`);
const userUpdatePayload = tools.requirePayload(`${__dirname}/assets/userUpdate.json`);
const userBalancePayload = tools.requirePayload(`${__dirname}/assets/userBalance.json`);

suite.forElement('rewards', 'users', { payload: userCreatePayload }, (test) => {
  let userId;
  let userEmail;

  before(() => {
    return cloud.get('/hubs/rewards/groups')
      .then(r => userCreatePayload.user.team_group_id = r.body[0].id);
  });

  test.should.supportPagination();

  it(`should allow CUS for ${test.api}`, () => {
    return cloud.post(test.api, userCreatePayload)
      .then(r => {
        userId = r.body.id;
        userEmail = r.body.email;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.put(`${test.api}/${userId}`, userUpdatePayload))
      .then(r => cloud.withOptions({ qs: { where: `email='${userEmail}'` } }).get(test.api));
  });

  it(`should allow C for ${test.api}/{id}/add-balance`, () => {
    return cloud.post(`${test.api}/${userId}/add-balance`, userBalancePayload);
  });

  it(`should allow D for ${test.api}`, () => {
    return cloud.delete(`${test.api}/${userId}`);
  });
});
