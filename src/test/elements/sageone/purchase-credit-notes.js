'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/purchase-credit-notes');
const chakram = require('chakram');
const build = (overrides) => Object.assign({}, payload, overrides);
const purchaseCreditPayload = build({ reference: "PCN" + tools.randomInt() });

suite.forElement('finance', 'purchase-credit-notes', { payload: purchaseCreditPayload }, (test) => {
  let code, id, contact_id, ledger_account_id;


  it(`should support CRUDS ${test.api}`, () => {
    cloud.get(`/hubs/finance/contacts`)
      .then(r => {
        contact_id = r.body[0].id;
      });
    cloud.get(`/hubs/finance/ledger-accounts`)
      .then(r => {
        ledger_account_id = r.body[0].id;
      });
      payload.contact_id = contact_id;
      payload.credit_note_lines[0].ledger_account_id = ledger_account_id;
      cloud.crus(chakram.put)
      .then(r => {
        code = r.body.reference;
        id = r.body.id;
        cloud
          .withName(`should support searching ${test.api} by reference`)
          .withOptions({ qs: { where: `search ='${code}'` } })
          .withValidation((r) => {
            expect(r).to.have.statusCode(200);
            const validValues = r.body.filter(obj => obj.reference === `${code}`);
            expect(validValues.length).to.equal(r.body.length);
          }).should.return200OnGet();
        return cloud.withOptions({ qs: { void_reason: `Temporary Reason` } }).delete(`${test.api}/${id}`);
      });
  });
  test.should.supportPagination();
});
