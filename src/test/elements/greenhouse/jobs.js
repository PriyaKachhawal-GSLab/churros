'use strict';

const suite = require('core/suite');
const payload = require('./assets/jobs');
const postingsPayload = require('./assets/postings');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = require('chakram').expect;
const queryString={ qs: { 'user_id': 461299 } };

suite.forElement('general', 'jobs', { payload: payload, }, (test) => {
	
	let jobId;
	before(() => cloud.post(test.api, payload)
    .then(r => jobId = r.body.id));
   
  test.should.supportCrus();
  test.withApi(test.api)
  .withOptions({ qs: { where: "created_after='2015-11-19T19:53:32.565Z'" } })
  .withValidation(r => expect(r.body.length).to.not.be.empty)
  .withName('should allow GET with all the entries after 2015-11-19T19:53:32.565Z')
  .should.return200OnGet();
  test.should.supportPagination(1);
  
  it('should support CRUDS for /jobs/:id/postings', () => {
    return cloud.withOptions(queryString).cruds(`${test.api}/${jobId}/postings`, postingsPayload, chakram.put);
  });
  
  it('should support where clause for /jobs/:id/postings',() =>{
	 return cloud.withOptions({ qs: { where: "status='opened'" } }).get(`${test.api}/${jobId}/postings`);
  });
});
