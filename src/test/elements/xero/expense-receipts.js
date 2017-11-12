'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const suite = require('core/suite');
const faker = require('faker');



suite.forElement('finance', 'expense-receipts', (test) => {
    it('should support CRUDS for /expense-receipts', () => {
        let expenseReceipt = require('./assets/expense-receipt.json');
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