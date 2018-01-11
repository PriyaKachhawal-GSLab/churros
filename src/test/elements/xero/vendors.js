'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');

let vendor = tools.requirePayload(`${__dirname}/assets/vendor.json`);
let invoice = tools.requirePayload(`${__dirname}/assets/vendor-invoice.json`);

suite.forElement('finance', 'vendors', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    
    it('should support CRUDS for /vendors', () => {
        let vendorId;
        let vendorUpdate = vendor;

        vendorUpdate.FirstName = vendor.Name.split(" ")[0];

        return cloud.post(test.api, vendor)
        .then(r => vendorId = r.body.ContactID)
        .then(r => cloud.get(`${test.api}/${vendorId}`))
        .then(r => expect(r.body.IsSupplier).to.be.false)
        .then(() => invoice.Contact.ContactID = vendorId)
        .then(() => cloud.withOptions({qs: {where: `Name='Advertising'`}}).get('/ledger-accounts'))
        .then(r => invoice.LineItems[0].AccountCode = r.body[0].Code)
        .then(() => cloud.post('/invoices', invoice))
        .then(() => cloud.patch(`${test.api}/${vendorId}`, vendorUpdate))
        .then(() => cloud.get(`${test.api}/${vendorId}`))
        .then(r => {
            expect(r.body.FirstName).to.equal(vendorUpdate.FirstName);
            expect(r.body.IsSupplier).to.be.true;
        })
        .then(() => cloud.withOptions({qs:{where: `ContactID='${vendorId}'`}}).get(test.api))
        .then(r => expect(r.body.length).to.equal(1))
        .then(() => cloud.delete(`${test.api}/${vendorId}`));
    });
});