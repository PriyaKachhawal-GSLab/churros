'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/users');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
let email = tools.randomEmail();
const userPayload = build({ displayName: tools.random(), lastName: tools.random(), emails: [email] });

suite.forElement('collaboration', 'users', null, (test) => {
  it(`should allow SR for ${test.api} and GET account`, () => {
    let userId, userEmail;
    return cloud.get(`/hubs/collaboration/accounts`)
      .then(r => userId = r.body.id)
      .then(r => cloud.get(`${test.api}/${userId}`))
      .then(r => userEmail = r.body.emails[0])
      .then(r => cloud.withOptions({ qs: { where: `email='${userEmail}'` } }).get(test.api));
  });

  it(`should allow CUD for ${test.api} with admin privileges`, () => {
    let updatePayload = (org) => ({
      "displayName": `${tools.random()}-update`,
      "emails": [
        email
      ],
      "firstName": tools.random(),
      "lastName": "update",
      "orgId": org
    });
    let body;
    return cloud.post(test.api, userPayload)
      .then(r => body = r.body)
      .then(r => cloud.put(`${test.api}/${body.id}`, updatePayload(body.orgId)))
      .then(r => cloud.delete(`${test.api}/${body.id}`));
  });
});
