'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const contactsPayload = require('./assets/contacts');
const notesPayload = require('./assets/notes');

suite.forElement('crm', 'contacts', { payload: contactsPayload }, (test) => {

  test.should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by word`)
    .withOptions({ qs: { where: 'word=\'Test\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('test'));
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
	
	
	

it('should allow CRUDS for contacts/{id}/notes', () => {
    let contactId = -1;
    return cloud.post(test.api, contactsPayload)
      .then(r => contactId = r.body.id)
      .then(r => cloud.cruds(`${test.api}/${contactId}/notes`, notesPayload, chakram.put))
      .then(r => cloud.post(`${test.api}/${contactId}/notes`, notesPayload))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${contactId}/notes`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`${test.api}/${contactId}`));
  });
});
