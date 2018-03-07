'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const payloadAddress = tools.requirePayload(`${__dirname}/assets/accounts_address.json`);
const payloadAddressUpdate = tools.requirePayload(`${__dirname}/assets/accounts_address.json`);
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
		   "ORGANISATION_NAME" : "ChurrosTest1" 
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by DATE_UPDATED_UTC`)
    .withOptions({ qs: { where: `updated_after_utc ='2018-02-21 07:31:45'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.DATE_UPDATED_UTC = '2018-02-21 07:31:45');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  let accountId;
  before(() => cloud.post(test.api, payload)
    .then(r => accountId = r.body.id));

  it('should allow CUD for accounts /addresses', () => {
  	let addressId;
  	return cloud.post(`${test.api}/${accountId}/addresses`, payloadAddress)
      .then(r => {
        addressId = r.body.id;
      })
      .then(r => cloud.put(`${test.api}/${accountId}/addresses/${addressId}`, payloadAddressUpdate))
      .then(r => cloud.delete(`${test.api}/${accountId}/addresses/${addressId}`));
  });

  after(() => cloud.delete(`${test.api}/${accountId}`));
});
