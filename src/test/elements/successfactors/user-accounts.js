'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const userAccountsCreatePayload = tools.requirePayload(`${__dirname}/assets/user-accounts-create.json`);
const userAccountsUpdatePayload = tools.requirePayload(`${__dirname}/assets/user-accounts-update.json`);

suite.forElement('humancapital', 'user-accounts', null, (test) => {
  let id;
  it.skip(`should allow Create for ${test.api}`, () => {
    return cloud.post(test.api, userAccountsCreatePayload);
  });
  
  it(`should allow RUS for ${test.api}`, () => {
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.put(`${test.api}/${id}`, userAccountsUpdatePayload));
  });
  
  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `userId='${id}'` } }).get(test.api)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
  test.should.supportPagination();
});