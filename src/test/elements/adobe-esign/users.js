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

const updateUsers = (groupId) => ({
  "lastName": "Lindahl",
  "groupId": "3AAABLblqZhAnEZAAp67NQsRPNvathlzHF82VbQuf5SsWIAW66k94p7hA5KU3jeBxg5rZaaMtaMXt817L8bXCQXoqQqhM26lY",
  "title": tools.random(),
  "phone": "866.830.3456",
  "email": "greg@cloud-elements.com",
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
  test.withJson(createUsers()).should.supportSr();
 test.withName(`should support searching ${test.api} by email`)
    .withOptions({ qs: { where: `email ='greg@cloud-elements.com'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Comp_Name = 'greg@cloud-elements.com');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  it(`should allow PUT for ${test.api}/{userId}`, () => {
    let userId;
    return cloud.get(test.api)
      .then(r => userId = r.body[0].id)
      .then(r => cloud.put(`${test.api}/${userId}`, updateUsers()));
  });
});
