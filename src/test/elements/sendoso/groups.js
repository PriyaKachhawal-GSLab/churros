'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const createPayload = tools.requirePayload(`${__dirname}/assets/groups.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/groupsUpdate.json`);
const limitsPayload = tools.requirePayload(`${__dirname}/assets/groupLimits.json`);
const userCreatePayload = tools.requirePayload(`${__dirname}/assets/userCreate.json`);

suite.forElement('rewards', 'groups', { payload: createPayload }, (test) => {
  let groupId;
  it(`should allow CUDS for ${test.api}`, () => {
    return cloud.post(test.api, createPayload)
      .then(r => groupId = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.put(`${test.api}/${groupId}`, updatePayload));
  });

  it(`should allow U on ${test.api}/{id}/group-limits`, () => {
    return cloud.put(`${test.api}/${groupId}/group-limits`, limitsPayload);
  });

  it(`should allow CUS for ${test.api}/{id}/touches`, () => {
    let touchId;
    let touchCreatePayload ={};
    let touchUpdatePayload = [];
    return cloud.get(`/hubs/rewards/touches`)
      .then(r => {
        touchId = r.body[0].id;
        touchCreatePayload.id = touchId;
        touchUpdatePayload.push({id : touchId})
      })
      .then(r => cloud.get(`${test.api}/${groupId}/touches`))
      .then(r => cloud.put(`${test.api}/${groupId}/touches`, touchCreatePayload))
      .then(r => cloud.put(`${test.api}/${groupId}/touches`, touchUpdatePayload))
  });

  test.should.supportPagination();

  it(`should allow CUDS for ${test.api}/{id}/members`, () => {
    let userEmail;
    let userId;
    let memberCreatePayload ={};
    let memberUpdatePayload = [];
    userCreatePayload.user.team_group_id = groupId;
    return cloud.post(`/hubs/rewards/users`, userCreatePayload)
      .then(r => {
        userId = r.body.id;
        userEmail = r.body.email;
        memberCreatePayload.email = userEmail;
        memberUpdatePayload.push({email : userEmail});
      })
      .then(r => cloud.put(`${test.api}/${groupId}/members`, memberCreatePayload))
      .then(r => cloud.get(`${test.api}/${groupId}/members`))
      .then(r => cloud.withOptions({ qs: { email: `${userEmail}` } }).delete(`${test.api}/${groupId}/members`))
      .then(r => cloud.put(`${test.api}/${groupId}/members`, memberUpdatePayload))
      .then(r => cloud.withOptions({ qs: { email: `${userEmail}` } }).delete(`${test.api}/${groupId}/members`))
      .then(r => cloud.delete(`/hubs/rewards/users/${userId}`));
  });

  it(`should allow S for ${test.api}/{id}/members/access`, () => {
    return cloud.get(`${test.api}/${groupId}/members/access`);
  });

  after(() => cloud.delete(`${test.api}/${groupId}`));

});
