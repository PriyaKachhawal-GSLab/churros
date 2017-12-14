'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect= require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);

suite.forElement('general', 'contacts', { payload: payload }, (test) => {
  let contactId;
  it('should test CRUDS of  contacts', () => {
  return cloud.get(test.api)
   .then(r => cloud.post(test.api, payload))
   .then(r => {
	       contactId=r.body.id;
	       payload.etag = r.body.etag;
              })
   .then(r => cloud.patch(`${test.api}/${contactId}`, payload))
   .then(r => cloud.get(`${test.api}/${contactId}`))
   .then(r => cloud.withOptions({ qs: { id: 'me' } }).get(`/hubs/general/contacts-batch`))
   .then(r => cloud.delete(`${test.api}/${contactId}`));
  });

  test
  .withName(`should support searching ${test.api} by sortOrder`)
  .withOptions({ qs: { where: `sortOrder = 'FIRST_NAME_ASCENDING'` } })
  .withValidation((r) => {
   expect(r).to.have.statusCode(200);
  //could not found way to validate response. It just sorting record with first_name
  }).should.return200OnGet();

  test.should.supportNextPagePagination(1);
});
