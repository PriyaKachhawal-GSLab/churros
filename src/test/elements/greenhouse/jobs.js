'use strict';

const suite = require('core/suite');
const payload = require('./assets/jobs');
const postingsPayload = require('./assets/postings');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = require('chakram').expect;
const queryString={ qs: { 'user_id': 461299 } };

 //Need to skip as there is no delete API 
suite.forElement('general', 'jobs', { payload: payload, skip:true}, (test) => {
	

	let jobId;
	before(() => cloud.post(test.api, payload)
    .then(r => jobId = r.body.id));
   
  //Need to skip as there is no delete API 
  test.withOptions({ skip: true }).should.supportCrus();
  test.withApi(test.api)
  .withOptions({ qs: { where: "created_after='2015-11-19T19:53:32.565Z'" } })
  .withValidation(r => expect(r.body[0].created_at>='2015-11-19T19:53:32.565Z'))
  .withName('should allow GET with all the entries after 2015-11-19T19:53:32.565Z')
  .should.return200OnGet();
  test.should.supportPagination(2);
  
  it('should support CRUDS for /jobs/:id/postings', () => {
    return cloud.withOptions(queryString).cruds(`${test.api}/${jobId}/postings`, postingsPayload, chakram.put);
  });
  
  it('should support where clause for /jobs/:id/postings',() =>{
	 return cloud.withOptions({ qs: { where: "status='opened'" } }).get(`${test.api}/${jobId}/postings`)
	 .then(r => expect(r.body.status==='open'));
  });
});
