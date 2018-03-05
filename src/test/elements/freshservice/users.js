'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/users.json`);
const email = tools.randomEmail();

suite.forElement('helpdesk', 'users', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();

  it(`should support searching ${test.api} by field email`, () => {
      let id, value;
      payload.email = email;
      return cloud.post(test.api, payload)
          .then(r => {
              id = r.body.id;
              value = r.body.email;
              const myOptions = {qs: {where: `email='${email}' and state='all'`}};
              return cloud.withOptions(myOptions).get(test.api, (r) => {
                  expect(r).to.have.statusCode(200);
                  expect(r.body).to.have.lengthOf(1);
                  expect(r.body[0].user.email).to.equal(email);
              });
          })
          .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
