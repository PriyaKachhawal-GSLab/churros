'use strict';
const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = require('./assets/candidates');
const attachmentPayload=require('./assets/attachment');
const notesPayload=require('./assets/notes');
const cloud = require('core/cloud');
const opts = { formData: { body: JSON.stringify(attachmentPayload) } };

const queryString={ qs: { 'User Id': 461299 } };

suite.forElement('general', 'candidates', { payload: payload, }, (test) => {
	
   let candidateId, resumeFile = __dirname + '/assets/resume.txt';
   before(() => cloud.post(test.api, payload)
   .then(r => candidateId = r.body.id));
   after(() => cloud.withOptions(queryString).delete(`${test.api}/${candidateId}`));

  it('should test POST of /attachments', () => {
	return cloud.withOptions(opts).postFile(`${test.api}/${candidateId}/attachments`, resumeFile);
  });
  
  test.withOptions(queryString).should.supportCruds();
  test.should.supportPagination(2);
  test.withApi(test.api)
    .withOptions({ qs: { where: "candidate_ids=47436388 and job_id=418899" } })
    .withValidation(r => expect(r.body.filter(obj => obj.id === "47436388")).to.not.be.empty)
    .withName('should allow GET with option candidateId and job_id')
    .should.return200OnGet();
  
  it('should test CR of /notes', () => {
	return cloud.post(`${test.api}/${candidateId}/notes`,notesPayload)
	.then(r =>cloud.get(`${test.api}/${candidateId}/notes`))
	.then(r=>{
		expect(r.body.length).to.not.be.empty;
	});
  });
  

}); 
