'use strict';
const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/jobs.json`);
const jobAdsPayload = tools.requirePayload(`${__dirname}/assets/jobAds.json`);
const postingPayload = tools.requirePayload(`${__dirname}/assets/jobPostingsPayload.json`);

suite.forElement('humancapital', 'jobs', { payload: payload }, (test) => {
  var jobId;
  before(() => cloud.post(test.api, payload)
    .then(r => jobId = r.body.id)
    //  .then(r => cloud.post(`${test.api}/${jobId}/job-ads`, payload))
    //.then(r => jobId = r.body.id)
  );
  // where is not supported
  it('should support CRUS for /jobs/{id}/job-ads', () => {
    return cloud.crus(`${test.api}/${jobId}/job-ads`, jobAdsPayload, chakram.put)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${jobId}/job-ads`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${jobId}/job-ads`));

  });

  // To post the job ads need some special permissions hence not every job we can post
  it.skip('should support CUD for /jobs/:id/job-ads/:jobId/posting', () => {
    return cloud.post(`${test.api}/${jobId}/job-ads/${jobId}/postings`, postingPayload)
      .then(r => cloud.get(`${test.api}/${jobId}/job-ads/${jobId}/postings`))
      .then(r => cloud.delete(`${test.api}/${jobId}/job-ads/${jobId}/postings`));

  });

});
