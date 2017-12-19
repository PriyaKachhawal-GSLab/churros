const cloud = require('core/cloud');
const suite = require('core/suite');
const expect = require('chakram').expect;
const commerce = require('faker').commerce;

suite.forElement('finance', 'invoices', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();

    it('should support CRUDS for /invoices',() => {
        const invoice = require('./assets/invoice.json');
        let invoiceId;
        const invoiceUpdate = {Reference: 'churros-' + commerce.product() };
        return cloud.withOptions({qs: {where: `Name='Sales'`}}).get('/ledger-accounts')
        .then(r => invoice.LineItems[0].AccountCode = r.body[0].Code)
        .then(() => cloud.post(test.api,invoice))
        .then(r => {
            expect(r.body.Reference).to.be.empty;
            invoiceId = r.body.id;
        })
        .then(r => cloud.get(`${test.api}/${invoiceId}`))
        .then(() => cloud.patch(`${test.api}/${invoiceId}`, invoiceUpdate))
        .then(r => expect(r.body.Reference).to.equal(invoiceUpdate.Reference))
        .then(() => cloud.withOptions({qs: {where: `InvoiceID='${invoiceId}'`}}).get(test.api))
        .then(r => expect(r.body[0].id).to.equal(invoiceId))
        .then(() => cloud.delete(`${test.api}/${invoiceId}`));
    });
});