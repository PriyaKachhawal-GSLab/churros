'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const expect = require('chakram').expect;
const faker = require('faker');


suite.forElement('finance', 'payments', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    
    it(`should support CRDS for /payments`, () => {
        const bankAccountName = 'ToBank-DoNotDelete';
        let invoiceNumber, invoiceId, accountId, paymentId;
        let paymentPayload = require('./assets/payment.json');
        let invoicePayload = require('./assets/payment-invoice.json');
        let invoiceUpdate = {Status: "VOIDED"};
        
        invoicePayload.Contact.Name = faker.name.findName();
        return cloud.withOptions({qs: {where: `Name='Sales'`}}).get('/ledger-accounts')
        .then(r => invoicePayload.LineItems[0].AccountCode = r.body[0].Code)
        .then(() => cloud.post('/invoices', invoicePayload))
        .then(r => {
            expect(r.body).to.not.be.empty;
            invoiceNumber = r.body.InvoiceNumber;
            invoiceId = r.body.id;
        })
        .then(() => cloud.withOptions({qs: {where: `Name='${bankAccountName}'`}}).get('/ledger-accounts'))
        .then(r => {
            expect(r.body.length).to.equal(1);
            expect(r.body[0].Name).to.equal(bankAccountName);
            accountId = r.body[0].AccountID;
        }, "Test relies on BANK account named 'ToBank-DoNotDelete'")
        .then(() => {
            paymentPayload.Account.AccountID = accountId;
            paymentPayload.Invoice.InvoiceNumber = invoiceNumber;
        })
        .then(() => cloud.post(`${test.api}`, paymentPayload))
        .then(r => {
            paymentId = r.body.PaymentID;
            cloud.get(`${test.api}/${paymentId}`)
        })
        .then(() => cloud.get(`${test.api}`))
        .then(() => cloud.delete(`${test.api}/${paymentId}`))
        .then(() => cloud.patch(`/invoices/${invoiceId}`, invoiceUpdate));
    });
});