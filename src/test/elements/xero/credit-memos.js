'use strict';

const cloud = require('core/cloud.js');
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');
const lorem = require('faker').lorem;
let creditMemoPayload = tools.requirePayload(`${__dirname}/assets/credit-memo.json`);
let allocationCreditMemo = tools.requirePayload(`${__dirname}/assets/credit-memo-POST-allocations.json`);
let allocationInvoice = tools.requirePayload(`${__dirname}/assets/invoice-POST-allocations.json`);
let payload = tools.requirePayload(`${__dirname}/assets/credit-memo-allocation.json`);

suite.forElement('finance', 'credit-memos', (test) => {
    let contactId;
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });

    before(() => {     
      let contactPayload = tools.requirePayload(`${__dirname}/assets/contact.json`);    
      return cloud.post('/contacts', contactPayload)
        .then(r => contactId = r.body.ContactID);
    });

    after(() => cloud.delete(`/contacts/${contactId}`));

    test.should.supportPagination();

  
    it('should support CRUDS for /credit-memos', () => {
      let creditMemoUpdate = {Reference: lorem.words()};
      creditMemoPayload.Contact.ContactID = contactId;
      
      return cloud.post(test.api, creditMemoPayload)
        .then((r) => cloud.get(`${test.api}/${r.body.CreditNoteID}`))
        .then((r) => cloud.patch(`${test.api}/${r.body.CreditNoteID}`, creditMemoUpdate))
        .then((r) => expect(r.body.Reference).to.equal(creditMemoUpdate.Reference))
        .then(() => cloud.withOptions({qs:{where: `Reference='${creditMemoUpdate.Reference}'`}}).get(test.api))
        .then((r) => {
          expect(r.body.length).to.equal(1);
          return cloud.delete(`${test.api}/${r.body[0].CreditNoteID}`);
        });
    });

    it('should support POST /credit-memos/:id/allocations', () => {
      let creditMemoId, invoiceId;
      allocationCreditMemo.Contact.ContactID = contactId;
      allocationInvoice.Contact.ContactID = contactId;
      return cloud.post(test.api, allocationCreditMemo)
        .then(r => creditMemoId = r.body.CreditNoteID)
        .then(() => cloud.post('/invoices', allocationInvoice))
        .then(r => invoiceId = r.body.id)
        .then(() => {
          payload.Invoice.InvoiceID = invoiceId;
        })
        .then(() => cloud.post(`${test.api}/${creditMemoId}/allocations`, payload));
    });

});