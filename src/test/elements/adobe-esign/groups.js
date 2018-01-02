'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const cloud = require('core/cloud');
const tools = require('core/tools');

const group = () => ({
  groupName: tools.random()
});

suite.forElement('esignature', 'groups', { payload: group()}, (test) => {
  test.should.supportCruds(chakram.put);
  it(`should allow GET for ${test.api}/{groupId}/users`, () => {
    let groupId;
    return cloud.post(test.api, group())
      .then(r => groupId = r.body.id)
      .then(r => cloud.get(`${test.api}/${groupId}/users`))
      .then(r => cloud.delete(`${test.api}/${groupId}`));
  });
});
