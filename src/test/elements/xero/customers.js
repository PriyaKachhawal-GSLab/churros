'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const faker = require('faker');
const suite = require('core/suite');
const tools = require('core/tools');

let customer = tools.requirePayload(`${__dirname}/assets/customer.json`);
let invoice = tools.requirePayload(`${__dirname}/assets/customer-invoice.json`);

suite.forElement('finance', 'customers', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    
    it('should support CRUDS for /customers', () => {
        let customerId;
        let customerUpdate = customer;

        customer.Name = faker.name.findName();
        customerUpdate.FirstName = customer.Name.split(" ")[0]; 

        return cloud.post(test.api, customer)
        .then(r => customerId = r.body.ContactID)
        .then(r => cloud.get(`${test.api}/${customerId}`))
        .then(r => expect(r.body.IsCustomer).to.be.false)
        .then(() => invoice.Contact.ContactID = customerId)
        .then(() => cloud.withOptions({qs: {where: `Name='Sales'`}}).get('/ledger-accounts'))
        .then(r => invoice.LineItems[0].AccountCode = r.body[0].Code)
        .then(() => cloud.post('/invoices', invoice))
        .then(() => cloud.patch(`${test.api}/${customerId}`, customerUpdate))
        .then(() => cloud.get(`${test.api}/${customerId}`))
        .then(r => {
            expect(r.body.FirstName).to.equal(customerUpdate.FirstName);
            expect(r.body.IsCustomer).to.be.true;
        })
        .then(() => cloud.withOptions({qs:{where: `ContactID='${customerId}'`}}).get(test.api))
        .then(r => expect(r.body.length).to.equal(1))
        .then(() => cloud.delete(`${test.api}/${customerId}`));
    });
});