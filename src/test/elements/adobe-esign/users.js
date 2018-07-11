'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect; 

const createUsers = () => ({
  "lastName": tools.random(),
  "email": tools.randomEmail(),
  "firstName": tools.random()
});

const updateUsers = (email) => ({
  "lastName": "Lindahl",
  "groupId": "3AAABLblqZhAnEZAAp67NQsRPNvathlzHF82VbQuf5SsWIAW66k94p7hA5KU3jeBxg5rZaaMtaMXt817L8bXCQXoqQqhM26lY",
  "title": tools.random(),
  "phone": "866.830.3456",
  "email": email,
  "roles": [
    "GROUP_ADMIN",
    "ACCOUNT_ADMIN"
  ],
  "company": "Cloud Elements",
  "firstName": "Greg"
});

suite.forElement('esignature', 'users', (test) => {
  /*
  //  Commented out POST /users, since there is no DELETE API for that.
    test.withJson(createUsers()).should.supportCrs();
  */
  let email = 'developer+adobesign@cloud-elements.com';
  test.withJson(createUsers()).should.supportSr();
  test.withName(`should support searching ${test.api} by email`)
    .withOptions({ qs: { where: `email ='${email}'` } })  
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.email = '${email}');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  it(`should allow PUT for ${test.api}/{userId}`, () => {
    let userId;
    let email;
    return cloud.get(test.api)
      .then(r => {
          userId = r.body[0].id;
          email = r.body[0].email;
      })
      .then(r => cloud.put(`${test.api}/${userId}`, updateUsers(email)));
  });
});
