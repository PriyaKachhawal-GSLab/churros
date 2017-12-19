'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const faker = require('faker');
const suite = require('core/suite');
const tools = require('core/tools');

let salesReceipt = tools.requirePayload(`${__dirname}/assets/sales-receipt.json`);

suite.forElement('finance', 'sales-receipts', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();

    it('should support CRUDS for /sales-receipts', () => {
        let salesReference = faker.commerce.product();
        const bankAccountName = 'ToBank-DoNotDelete';
        let receiptUpdate = { Reference: salesReference};
        let receiptId, accountId;

        salesReceipt.Contact.Name = faker.name.firstName();
        // Need a Xero user ID to get this done
        
        return cloud.withOptions({qs: {where: `Name='${bankAccountName}'`}}).get('/ledger-accounts')
        .then(r => accountId = r.body[0].AccountID)
        .then(() => salesReceipt.BankAccount.AccountID = accountId)
        .then(() => cloud.withOptions({qs: {where: `Name='Sales'`}}).get('/ledger-accounts'))
        .then(r => salesReceipt.LineItems[0].AccountCode = r.body[0].Code)
        .then(() => cloud.post(test.api, salesReceipt))
        .then(r => receiptId = r.body.BankTransactionID)
        .then(() => cloud.get(`${test.api}/${receiptId}`))
        .then(r => expect(r.body.Reference).to.be.empty)
        .then(() => cloud.patch(`${test.api}/${receiptId}`, receiptUpdate))
        .then(r => expect(r.body.Reference).to.equal(salesReference))
        .then(() => cloud.get(test.api))
        .then(() => cloud.delete(`${test.api}/${receiptId}`));
    });
    
});