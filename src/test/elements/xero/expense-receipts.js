'use strict';

const cloud = require('core/cloud');
const faker = require('faker');
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');

let expenseReceipt = tools.requirePayload(`${__dirname}/assets/expense-receipt.json`);

suite.forElement('finance', 'expense-receipts', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    
    it('should support CRUDS for /expense-receipts', () => {
        let expenseReference = faker.commerce.product();
        let receiptUpdate = { Reference: expenseReference, User: {"UserID": ""} };
        let receiptId, userId;
        
        // Need a Xero user ID to get this done
        return cloud.get('/Users')
        .then(r => userId = r.body[0].UserID)
        .then(() => {
            expenseReceipt.User.UserID = userId;
            receiptUpdate.User.UserID = userId;
        })
        .then(() => cloud.withOptions({qs: {where: `ShowInExpenseClaims=true`}}).get('/ledger-accounts'))
        .then(r => expenseReceipt.LineItems[0].AccountCode = r.response.body[0].Code)
        .then(() => cloud.post(test.api, expenseReceipt))
        .then(r => receiptId = r.body.ReceiptID)
        .then(() => cloud.get(`${test.api}/${receiptId}`))
        .then(r => expect(r.body.Reference).to.be.empty)
        .then(() => cloud.patch(`${test.api}/${receiptId}`, receiptUpdate))
        .then(r => expect(r.body.Reference).to.equal(expenseReference))
        .then(() => cloud.get(test.api))
        .then(() => cloud.delete(`${test.api}/${receiptId}`));
    });
    
});