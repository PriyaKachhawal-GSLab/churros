'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('./assets/contacts');
const payloadAddress = tools.requirePayload(`${__dirname}/assets/contacts_address.json`);
const payloadAddressUpdate = tools.requirePayload(`${__dirname}/assets/contacts_address.json`);
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

const options = {
    churros: {
      updatePayload: {
        "last_name": "Mac_updated" 
      }
    }
  };

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by DATE_UPDATED_UTC`)
    .withOptions({ qs: { where: `updated_after_utc ='2018-02-21 07:31:45'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.DATE_UPDATED_UTC = '2018-02-21 07:31:45');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  let contactId;
  before(() => cloud.post(test.api, payload)
    .then(r => contactId = r.body.id));

  it('should allow CUD for ${test.api}/:id/addresses', () => {
  	let addressId;
  	return cloud.post(`${test.api}/${contactId}/addresses`, payloadAddress)
      .then(r => addressId = r.body.id)
      .then(r => cloud.put(`${test.api}/${contactId}/addresses/${addressId}`, payloadAddressUpdate))
      .then(r => cloud.delete(`${test.api}/${contactId}/addresses/${addressId}`));
  });
  
  after(() => cloud.delete(`${test.api}/${contactId}`));
});
