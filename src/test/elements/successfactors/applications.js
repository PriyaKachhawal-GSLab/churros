'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/jobApplications.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;


suite.forElement('Humancapital', 'applications', { payload: payload }, (test) => {
  let id;
  it.skip(`should allow Create for ${test.api}`, () => {
    return cloud.post(test.api, payload);
  });
  
  it(`should allow RUS for ${test.api}`, () => {
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, payload));
  });
  
  it(`should allow GET for ${test.api}/statuses`, () => {
    return cloud.get(`${test.api}/${id}/statuses`);
  });
  
  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `applicationId='${id}'` } }).get(test.api)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
  test.should.supportPagination();
});
