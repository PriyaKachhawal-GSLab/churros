'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const customerPayload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const payload = tools.requirePayload(`${__dirname}/assets/customerBankAccounts.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/customerBankAccountsUpdate.json`);

suite.forElement('finance', 'customer-bank-accounts', { payload: payload }, (test) => {
  let customerId;
  before(() => cloud.post('/hubs/finance/customers', customerPayload)
    .then(r => customerId = r.body.id)
    .then(r => payload.customerid = customerId));

  it(`should allow CUD for ${test.api}`, () => {
    let bankAccountId;
    return cloud.post(test.api, payload)
      .then(r => bankAccountId = r.body.customerBankAccountsid)
      .then(r => cloud.patch(`${test.api}/${bankAccountId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${bankAccountId}`));
  });

  after(() => cloud.delete(`/hubs/finance/customers/${customerId}`));
});
