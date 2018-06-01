'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const faker = require('faker');
const payload = tools.requirePayload(`${__dirname}/assets/candidates.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;

payload.primaryEmail = faker.internet.email();

suite.forElement('Humancapital', 'candidates', { payload: payload }, (test) => {
  let id;
  const options = {
    churros: {
      updatePayload: { "cellPhone":"+1 1123232" }
    }
  };

  test.withOptions(options).should.supportCrus();
  test.should.supportPagination();

  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.get(`${test.api}`) 
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `candidateId='${id}'` } }).get(test.api))
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
});
