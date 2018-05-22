'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const faker = require('faker');
const suite = require('core/suite');
const tools = require('core/tools');

let overpayment = tools.requirePayload(`${__dirname}/assets/overpayments.json`);
let invoicePayload = tools.requirePayload(`${__dirname}/assets/overpaymentInvoice-POST-allocations.json`);
let allocationOverpayment = tools.requirePayload(`${__dirname}/assets/overpayment-POST-allocations.json`);

suite.forElement('finance', 'overpayments', (test) => {
  let overpaymentId;
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });

    test.should.supportPagination();

    it('should support CRS for /overpayments', () => {
        const bankAccountName = 'ToBank-DoNotDelete';
        let accountId;

        overpayment.Contact.Name = faker.name.firstName();
        // Need a Xero user ID to get this done

        return cloud.withOptions({qs: {where: `Name='${bankAccountName}'`}}).get('/ledger-accounts')
        .then(r => accountId = r.body[0].AccountID)
        .then(() => overpayment.BankAccount.AccountID = accountId)
        .then(() => cloud.post('/hubs/finance/sales-receipts', overpayment))
        .then(r => overpaymentId = r.body.OverpaymentID)
        .then(() => cloud.get(`${test.api}/${overpaymentId}`))
        .then(r => expect(r.body.Type).to.equal('SPEND-OVERPAYMENT'))
        .then(() => cloud.get(test.api))
        .then(r => expect(r.body[0]).to.have.property('Type'))
    });

    it('should support POST /overpayments/:id/allocations', () => {
      return cloud.withOptions({ qs: { where: `Name='Sales'` } }).get('/ledger-accounts')
        .then(r => invoicePayload.LineItems[0].AccountCode = r.body[0].Code)
        .then(() => cloud.post('/invoices', invoicePayload))
        .then(r => allocationOverpayment.Invoice.InvoiceID = r.body.id)
        .then(() =>cloud.post(`${test.api}/${overpaymentId}/allocations`, allocationOverpayment))
        .then(r => expect(r.body).to.have.property('Overpayment'))
    });
});
