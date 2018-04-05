'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/invoices');
const chakram = require('chakram');
const build = (overrides) => Object.assign({}, payload, overrides);
const purchaseCreditPayload = build({ reference: "INVV" + tools.randomInt() });

suite.forElement('finance', 'invoices', { payload: purchaseCreditPayload }, (test) => {
  let code, id, contact_id, tax_rate_id, ledger_account_id;
  it(`should support CRUS ${test.api}`, () => {
    cloud.get(`/hubs/finance/contacts`)
      .then(r => {
        contact_id = r.body[0].id;
      });
    cloud.get(`/hubs/finance/ledger-accounts`)
      .then(r => {
        ledger_account_id = r.body[0].id;
      });
    cloud.get(`/hubs/finance/tax_rates`)
      .then(r => {
        tax_rate_id = r.body[0].id;
      });
    payload.contact_id = contact_id;
    payload.invoice_lines[0].ledger_account_id = ledger_account_id;
    payload.invoice_lines[0].tax_rate_id = tax_rate_id;
    test.should.supportCrus(chakram.put);
  });

  test.should.supportPagination();

  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => {
        code = r.body[0].reference;
        id = r.body[0].id;
        test
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
});
