'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/users.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const chakram = require('chakram');
const faker = require('faker');

suite.forElement('Humancapital', 'user-accounts', { payload: payload }, (test) => {
  let id;
  const options = {
    churros: {
      updatePayload: {
        "firstName": faker.random.word(),
        "status": "T",
        "username": faker.random.word()
      }
    }
  };

  test.withOptions(options).should.supportCrus(chakram.put);
  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.get(`${test.api}`) 
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `userId='${id}'` } }).get(test.api))
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
  test.should.supportPagination();
});
