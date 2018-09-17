'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const candidatesCreatePayload = tools.requirePayload(`${__dirname}/assets/candidates-create.json`);
const candidatesUpdatePayload = tools.requirePayload(`${__dirname}/assets/candidates-update.json`);

suite.forElement('humancapital', 'candidates', null, (test) => {
  let id;
  it.skip(`should allow Create for ${test.api}`, () => {
    return cloud.post(test.api, candidatesCreatePayload);
  });
  
  it(`should allow RUS for ${test.api}`, () => {
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, candidatesUpdatePayload));
  });
  
  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `candidateId='${id}'` } }).get(test.api)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
  test.should.supportPagination();
});

