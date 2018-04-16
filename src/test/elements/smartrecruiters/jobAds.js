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
    .then(r => jobId = r.body.id));
  	 after(() => cloud.delete(`/hubs/humancapital/jobs/${jobId}`));

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
});
