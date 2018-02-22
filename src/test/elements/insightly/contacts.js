'use strict';

const suite = require('core/suite');
const payload = require('./assets/contacts');
const payloadAddress = require('./assets/contacts_address');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "last_name": "Mac_updated"
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
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

  it('should allow CUD for / addresses', () => {
  	let addressId;
  	let addrPayload;
  	return cloud.post(`${test.api}/${contactId}/addresses`, payloadAddress)
      .then(r => {
        addressId = r.body.id;
        addrPayload = {
          "ADDRESS_TYPE": "WORK",
          "STREET": "XYZZ",
          "CITY": "ABCC",
          "STATE": "MH",
          "POSTCODE": "411245",
          "COUNTRY": "India"
        };
      })
      .then(r => cloud.put(`${test.api}/${contactId}/addresses/${addressId}`, addrPayload))
      .then(r => cloud.delete(`${test.api}/${contactId}/addresses/${addressId}`));
  });
  
  after(() => cloud.delete(`${test.api}/${contactId}`));
});
