'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/jobs.json`);
const payload1 = tools.requirePayload(`${__dirname}/assets/jobs.json`);
const payloadCandidate = tools.requirePayload(`${__dirname}/assets/candidates.json`);
const hiringPayload = tools.requirePayload(`${__dirname}/assets/hiringTeams.json`);
const jobAdsPayload = tools.requirePayload(`${__dirname}/assets/jobAds.json`);
const notesPayload = tools.requirePayload(`${__dirname}/assets/jobsNotes.json`);
const jobPositionPayload = tools.requirePayload(`${__dirname}/assets/jobsPostions.json`);
const postingPayload = tools.requirePayload(`${__dirname}/assets/jobPostingsPayload.json`);

const options = {
  churros: {
    updatePayload: {
      "op": "replace",
      "path": "/title",
      "value": "New Title"
    }
  }
};
suite.forElement('humancapital', 'jobs', { payload: payload }, (test) => {
  var jobId;
  before(() => cloud.post(test.api, payload1)
    .then(r => jobId = r.body.id)
    .then(r => cloud.get('/hubs/humancapital/users'))
    .then(r => hiringPayload.id = r.body[r.body.length - 1].id));

  after(() => cloud.delete(`${test.api}/${jobId}`));

  test.should.supportCruds(chakram.put);
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination(1);
  test.withOptions({ qs: { where: `updatedAfter = '2013-02-26T12:50:02.594+0000' ` } })
    .withName('should support Ceql updatedAfter search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.updatedOn >= '2013-02-26T12:50:02.594+0000');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  // where is not supported
  it('should support CRUS for /jobs/{id}/job-ads', () => {
    return cloud.crus(`${test.api}/${jobId}/job-ads`, jobAdsPayload, chakram.put)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jobId}/job-ads`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${jobId}/job-ads`));
  });

  it('should support CUD for /jobs/:id/job-ads/:jobAdsId/posting', () => {
    let jobAdsId;
    return cloud.get(`${test.api}/${jobId}/job-ads`)
      .then(r => jobAdsId = r.body[0].id)
      .then(cloud.post(`${test.api}/${jobId}/job-ads/${jobAdsId}/postings`, postingPayload))
      .then(r => cloud.get(`${test.api}/${jobId}/job-ads/${jobAdsId}/postings`))
      .then(r => cloud.delete(`${test.api}/${jobId}/job-ads/${jobAdsId}/postings`));
  });

  it('should support CUD for /jobs/:id/hiring-teams', () => {
    return cloud.post(`${test.api}/${jobId}/hiring-teams`, hiringPayload)
      .then(r => cloud.get(`${test.api}/${jobId}/hiring-teams`))
      .then(r => cloud.delete(`${test.api}/${jobId}/hiring-teams/${hiringPayload.id}`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jobId}/hiring-teams`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${jobId}/hiring-teams`));

  });


  it('should support C /jobs/:id/candidates and  C /jobs/:id/candidates/cv', () => {
    let path = __dirname + '/assets/Resumes.pdf';
    return cloud.post(`${test.api}/${jobId}/candidates`, payloadCandidate)
      .then(r => cloud.postFile(`${test.api}/${jobId}/candidates/resumes`, path));
  });

  //pagination not supported
  it('should support SU for /jobs/:id/notes', () => {
    return cloud.put(`${test.api}/${jobId}/notes`, notesPayload)
      .then(r => cloud.get(`${test.api}/${jobId}/notes`));
  });

  //where is not supported
  it('should support CRUDS for /jobs/{id}/positions', () => {
    return cloud.cruds(`${test.api}/${jobId}/positions`, jobPositionPayload, chakram.put)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jobId}/positions`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${jobId}/positions`));
  });

});
