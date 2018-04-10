'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = tools.requirePayload(`${__dirname}/assets/candidates.json`);
const payload1 = tools.requirePayload(`${__dirname}/assets/candidates.json`);
const jobPayload = tools.requirePayload(`${__dirname}/assets/jobs.json`);
const statusPayload = tools.requirePayload(`${__dirname}/assets/statusUpdate.json`);
const onBordingPayload =tools.requirePayload(`${__dirname}/assets/onBording.json`);
const cloud = require('core/cloud');

suite.forElement('humancapital', 'candidates', { payload: payload }, (test) => {

  var jobId, candidatesId;
  before(() => cloud.post('/hubs/humancapital/jobs', jobPayload)
    .then(r => jobId = r.body.id)
    .then(r => cloud.post(`/hubs/humancapital/jobs/${jobId}/candidates`, payload1))
    .then ( r => candidatesId= r.body.id)  );

  after(() => cloud.delete(`/hubs/humancapital/jobs/${jobId}`));

  test.should.supportCruds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: `updatedAfter = '2013-02-26T12:50:02.594+0000' ` } })
    .withName('should support Ceql updatedAfter search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.updatedOn >= '2013-02-26T12:50:02.594+0000');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

// pagination is not supported hence not added pagination test
it('should support SU for /candidates/{candidatesId}/jobs/:id/onboarding-status', () => {
  return cloud.put(`${test.api}/${candidatesId}/jobs/${jobId}/onboarding-status`, onBordingPayload)
  .then(r => cloud.get(`${test.api}/${candidatesId}/jobs/${jobId}/onboarding-status`) );
});

//We can not post the offers  hence mark it as skip
it.skip('should support SU for /candidates/{candidatesId}/jobs/:id/offers', () => {
  let offerId;
  return cloud.get(`${test.api}/${candidatesId}/jobs/${jobId}/offers`)
  .then ( r => offerId= r.body[0].id)
  .then(r => cloud.get(`${test.api}/${candidatesId}/jobs/${jobId}/offers/${offerId}`) );
});

it.skip('should support U for /candidates/{candidatesId}/jobs/:id/status', () => {
  return cloud.put(`${test.api}/${candidatesId}/jobs/${jobId}/status`,statusPayload);
});
});
