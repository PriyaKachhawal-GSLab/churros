'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/vendors');
const chakram = require('chakram');
const build = (overrides) => Object.assign({}, payload, overrides);
const vendorsPayload = build({ reference: "re" + tools.randomInt(), name: "name" + tools.randomInt() });

suite.forElement('finance', 'vendors', { payload: vendorsPayload }, (test) => {
  let id;
  test.should.supportCrus(chakram.put);
  test.should.supportPagination();
  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => {
        if (r.body.length <= 0) {
          return;
        }
        id = r.body[0].reference;
        test
          .withName(`should support searching ${test.api} by reference`)
          .withOptions({ qs: { where: `attributes ='${id}'` } })
          .withValidation((r) => {
            expect(r).to.have.statusCode(200);
            const validValues = r.body.filter(obj => obj.reference === `${id}`);
            expect(validValues.length).to.equal(r.body.length);
          }).should.return200OnGet();
      });
  });

  it('should validate GET /vendors/{id} response payload', () => {
    let newVendorPayload = build({ reference: "re" + tools.randomInt(), name: "name" + tools.randomInt() });
    let vendorId;
    return cloud.post(test.api, newVendorPayload)
      .then(r => vendorId = r.body.id)
      .then(r => cloud.get(`${test.api}/${vendorId}`))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body).to.not.be.null &&
        expect(r.body).to.contain.key('bank_account_details') &&
        expect(r.body).to.contain.key('default_purchase_ledger_account') &&
        expect(r.body).to.contain.key('main_contact_person') &&
        expect(r.body).to.contain.key('main_address') &&
        expect(r.body).to.contain.key('displayed_as') &&
        expect(r.body).to.contain.key('id') &&
        expect(r.body.id).to.equal(vendorId));
  });
});
