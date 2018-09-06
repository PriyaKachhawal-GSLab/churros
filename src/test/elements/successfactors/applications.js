'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const applicationsCreatePayload = tools.requirePayload(`${__dirname}/assets/applications-create.json`);
const applicationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/applications-update.json`);

suite.forElement('Humancapital', 'applications', null, (test) => {
  let id;
  it.skip(`should allow Create for ${test.api}`, () => {
    return cloud.post(test.api, applicationsCreatePayload);
  });
  
  it(`should allow RUS for ${test.api}`, () => {
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, applicationsUpdatePayload));
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
