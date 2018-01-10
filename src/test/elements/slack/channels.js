'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = require('./assets/channels');
// define all public supported actions and payloads
const publicActions = [
  { 'action': 'join', 'name': 'random' },
  { 'action': 'read', 'ts': Math.trunc(Date.parse(new Date())/1000).toString() },
  { 'action': 'archive' },
  { 'action': 'unarchive' },
  { 'action': 'rename', 'name': tools.random() },
  { 'action': 'purpose', 'purpose': 'eat yummy churros' },
  { 'action': 'topic', 'topic': 'tasty desserts' },
  { 'action': 'leave' }
];

suite.forElement('collaboration', 'channels', (test) => {
  let privateChannelId, publicChannelId;
  let invitedUser = { 'users': '' };
  payload.name = tools.random();
  before((done) => cloud.withOptions({ qs: { private: true } }).post(test.api, payload)
    .then(r => {
      privateChannelId = r.body.id;
      payload.name = tools.random();
    })
    .then(r => cloud.get(`users`))
    .then(r => invitedUser.users = r.body[2].id)
    .then(r => cloud.withOptions({ qs: { private: true } }).post(`${test.api}/${privateChannelId}/user`, invitedUser))
    .then(r => cloud.post(test.api, payload))
    .then(r => publicChannelId = r.body.id)
    .then(r => done()));
  // we are archiving the channels in the /actions tests

  //test for GET channels
  test.should.return200OnGet();
  test.should.supportPagination();

  //tests for /messages apis
  let timestamp;
  let channelMessage = { 'text': 'How are you' };
  it(`should allow CUD ${test.api}/messages`, () => {
    return cloud.post(`${test.api}/${privateChannelId}/messages`, channelMessage) // test for POST channels/{channelId}/messages
      .then(r => timestamp = r.body.ts)
      .then(r => cloud.patch(`${test.api}/${privateChannelId}/messages`, { 'ts': timestamp, 'text': 'Hey Guys' })) // test for PATCH channels/{channelId}/messages
      .then(r => cloud.delete(`${test.api}/${privateChannelId}/messages/${timestamp}`)); //test for delete channels/{channelId}/messages/{timestamp}
  });

  // test for invite, kick, my-messages and history
  let inviteUser = { 'users': '' };
  it(`should allow GET ${test.api}`, () => {
    return cloud.get(`users`)
      .then(r => inviteUser.users = r.body[1].id); //get a user
  });
  it(`should allow CD ${test.api}/:channelId/user`, () => {
    return cloud.withOptions({ qs: { private: true } }).post(`${test.api}/${privateChannelId}/user`, inviteUser) // test for POST channels/{channelId}/user
      .then(r => cloud.withOptions({ qs: { private: true } }).delete(`${test.api}/${privateChannelId}/user/${inviteUser.users}`)); // test for delete channels/{channelId}/user/{userId}
  });

  it(`should allow POST ${test.api}/:channelId/my-messages api`, () => {
    return cloud.withOptions({ qs: { private: true } }).post(`${test.api}/${privateChannelId}/my-messages`, { 'text': 'Hello' }); // test for POST channels/{channelId}/my-messages
  });

  it(`should allow GET ${test.api}/:channelId/history api`, () => {
    return cloud.withOptions({ qs: { private: false } }).get(`${test.api}/${publicChannelId}/history`);
  });

  it(`should allow where count GET ${test.api}/:channelId/history api`, () => {
    return cloud.withOptions({ qs: { private: false, where: 'count = 1' } }).get(`${test.api}/${publicChannelId}/history`);
  });

  it(`should allow paginating with page and pageSize for ${test.api}`, () => {
    return cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${publicChannelId}/history`)
      .then(r => expect(r.body.length).to.be.below(2));
  });
  //TODO get these working - begin doesn't populate a variable for a suite test :(
  // test.withApi(`${test.api}/${publicChannelId}/history`).should.supportPagination();
  // test.withApi(`${test.api}/${publicChannelId}/history`).withOptions({ qs: { 'where': 'count = 1 ' } }).should.return200OnGet();

  it(`should allow GET ${test.api}`, () => {
    return cloud.withOptions({ qs: { private: true } }).get(test.api)
      .then(r => publicActions[0].name = r.body[0].id); //get a user for 'actions' apis
  });

  //TODO (@tylertoth) a few of these fail due various issues. Need to reorganize these...
  // define all private supported actions and payloads
  const privateActions = [
    { 'action': 'read', 'ts': Math.trunc(Date.parse(new Date())/1000).toString() },
    { 'action': 'archive' },
    { 'action': 'unarchive' },
    { 'action': 'rename', 'name': tools.random() },
    { 'action': 'purpose', 'purpose': 'eat yummy churros' },
    { 'action': 'topic', 'topic': 'tasty desserts' },
    { 'action': 'leave' }
  ];

  privateActions.forEach(ac => {
      it(`should allow PATCH ${test.api}/:channelId/actions?action='${ac.action}' for private channels (groups)`, () =>
        cloud.withOptions({ qs: { private: true } }).patch(`${test.api}/${privateChannelId}/actions`, ac));
    }
  );
  publicActions.forEach(ac => {
      it(`should allow PATCH ${test.api}/:channelId/actions?action='${ac.action}' for public channels`, () =>
        cloud.withOptions({ qs: { private: false } }).patch(`${test.api}/${publicChannelId}/actions`, ac));
    }
  );

});
