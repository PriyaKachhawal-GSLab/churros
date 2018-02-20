'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');
const payloadAddress = require('./assets/accounts_address');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
		"ORGANISATION_NAME":"ChurrosTest1"
	  }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `organisation_name ='ChurrosTest1'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.ORGANISATION_NAME = 'ChurrosTest1');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  let accountId;
  before(() => cloud.post(test.api, payload)
    .then(r => accountId = r.body.id));

  it('should allow CUD for / addresses', () => {
  	let addressId;
  	let addrPayload;
  	return cloud.post(`${test.api}/${accountId}/addresses`, payloadAddress)
      .then(r => {
        addressId = r.body.id;
        addrPayload = {
  			"ADDRESS_TYPE": "Home",
  			"STREET": "S11",
  			"CITY": "C11",
  			"STATE": "ST1",
			"POSTCODE": "411045",
  			"COUNTRY": "India"
		};
      })
      .then(r => cloud.put(`${test.api}/${accountId}/addresses/${addressId}`, addrPayload))
      .then(r => cloud.delete(`${test.api}/${accountId}/addresses/${addressId}`));
  });
  
  after(() => cloud.delete(`${test.api}/${accountId}`));
});
