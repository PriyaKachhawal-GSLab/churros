'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/JobRequisition.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/requisitionsUpdate.json`);

const cloud = require('core/cloud');
const expect = require('chakram').expect;


suite.forElement('Humancapital', 'requisitions', { payload: payload }, (test) => {
  let id;
  it(`should allow CRUDS for ${test.api}`, () => {
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.get(`${test.api}`));
  });
  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `jobReqId='${id}'` } }).get(test.api)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
  test.should.supportPagination();
});
