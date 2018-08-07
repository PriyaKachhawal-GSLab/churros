const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const creditcardPayload = tools.requirePayload(`${__dirname}/assets/creditcard.json`);
const payload2 = tools.requirePayload(`${__dirname}/assets/creditcard2.json`);
const customerpayload = tools.requirePayload(`${__dirname}/assets/customersAccounts.json`);
const payloadcustomer = tools.requirePayload(`${__dirname}/assets/customers.json`);
const creditcarddeposits = tools.requirePayload(`${__dirname}/assets/creditcarddeposits.json`);

//Skipping the test since to POST a credit-card we need to create a customer first and customers object has limits of records which can be created
suite.forElement('rewards', 'credit-cards', { skip: true }, (test) => {
  it('should allow Csr for credit-cards and credit-cards-deposits', () => {
     let accountId, customerId, depositId, id;
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
        id = r.body.id;
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
        depositId = r.body.referenceDepositID;
      })
      .then(r => cloud.get(`credit-cards-deposits/${depositId}`))
     .then(r => cloud.withOptions({ qs: { customerId: creditcarddeposits.customerIdentifier, accountId: creditcarddeposits.accountIdentifier } }).delete(`${test.api}/${id}`));
  });
 test.should.supportPagination();
});
