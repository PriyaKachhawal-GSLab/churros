const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const creditcardPayload = tools.requirePayload(`${__dirname}/assets/creditcard.json`);
const payload2 = tools.requirePayload(`${__dirname}/assets/creditcard2.json`);
const customerpayload = require('core/tools').requirePayload(`${__dirname}/assets/customersAccounts.json`);
const payloadcustomer = require('core/tools').requirePayload(`${__dirname}/assets/customers.json`);
const creditcarddeposits = require('core/tools').requirePayload(`${__dirname}/assets/creditcarddeposits.json`);

//Skipping the test to POSt an credit-card we need to create customer first and customers object has limits of records to be create_discount_coupons
suite.forElement('rewards', 'credit-cards', {skip: true}, (test) => {
 let accountId, customerId, depositId;
 it('should allow Csr for credit-cards and credit-cards-deposits', () => {
  return cloud.post('/customers', payloadcustomer)
   .then(r => customerId = r.body.id)
   .then(r => cloud.post(`customers/${customerId}/accounts`, customerpayload))
   .then(r => accountId = r.body.id)
   .then(r => {
    creditcardPayload.accountIdentifier = accountId;
    creditcardPayload.customerIdentifier = customerId;
   })
   .then(r => cloud.post(`${test.api}`, creditcardPayload))
   .then(r => {
    id = r.body.id
   })
   .then(r => cloud.get(`${test.api}/${id}`))
   .then(r => {
    payload2.accountIdentifier = accountId;
    payload2.customerIdentifier = customerId;
   })
   .then(r => {
    creditcarddeposits.accountIdentifier = accountId;
    creditcarddeposits.customerIdentifier = customerId;
   })
   .then(r => cloud.post(`credit-cards/${id}/deposits`, creditcarddeposits))
   .then(r => {
    depositId = r.body.id
   })
   .then(r => cloud.get(`credit-cards/deposits/${depositId}`))
   .then(r => cloud.post(`${test.api}/${id}/unregister`, payload2));
 })
});
