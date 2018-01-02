'use strict';

const cloud = require('core/cloud.js');
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');
const lorem = require('faker').lorem;

suite.forElement('finance', 'credit-memos', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    test.should.supportPagination();
    it('should support CRUDS for /credit-memos', () => {
      const contactWrap = (cb) => {
          let contactId;
          let contactPayload = tools.requirePayload(`${__dirname}/assets/contact.json`);    

          return cloud.post('/contacts', contactPayload)
          .then(r => contactId = r.body.ContactID)
          .then(() => cb(contactId))
          .then(() => cloud.delete(`/contacts/${contactId}`));
      };
      
      const cb = (contactId) => {
        let creditMemoPayload = tools.requirePayload(`${__dirname}/assets/credit-memo.json`);
        let creditMemoUpdate = {Reference: lorem.words()};
        creditMemoPayload.Contact.ContactID = contactId;
        
          return cloud.post(test.api, creditMemoPayload)
          .then((r) => cloud.get(`${test.api}/${r.body.CreditNoteID}`))
          .then((r) => cloud.patch(`${test.api}/${r.body.CreditNoteID}`, creditMemoUpdate))
          .then((r) => expect(r.body.Reference).to.equal(creditMemoUpdate.Reference))
          .then(() => cloud.withOptions({qs:{where: `Reference='${creditMemoUpdate.Reference}'`}}).get(test.api))
          .then((r) => {
            expect(r.body.length).to.equal(1);
            cloud.delete(`${test.api}/${r.body[0].CreditNoteID}`);
          });
        };
        return contactWrap(cb);
  });

});