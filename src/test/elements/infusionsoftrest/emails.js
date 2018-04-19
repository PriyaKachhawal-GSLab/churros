'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');

let payload = tools.requirePayload(`${__dirname}/assets/emails.json`);
let syncEmailPayload = tools.requirePayload(`${__dirname}/assets/syncEmail.json`);
const unsyncEmailPayload = {"ids": []};

suite.forElement('crm', 'emails', { payload: payload },(test) => {
  test.should.supportCrds();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'email=\'developer@cloud-elements.com\'' } })
    .withName('should support search by send_to_address')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.sent_to_address = 'developer@cloud-elements.com');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  
  it('should support C for /emails/sync', () => {
    	return cloud.post('/emails/sync', syncEmailPayload)
    	.then(r => unsyncEmailPayload.ids[0] = r.body[0].id);
  });

  it('should support C for /emails/unsync', () => {
    	return cloud.post('/emails/unsync', unsyncEmailPayload);
  });
});