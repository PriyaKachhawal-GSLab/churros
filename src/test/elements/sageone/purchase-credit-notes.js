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
  let code, id;

  before(() => {
    return cloud.get(`/hubs/finance/contacts`)
      .then(r => purchaseCreditPayload.contact_id = r.body[0].id);
  });
  test.should.supportCrus(chakram.put);
  test.should.supportPagination();
  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api)
      .then(r => code = r.body[0].reference)
      .then(r => cloud.get(test.api))
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { void_reason: `Temporary Reason` } }).delete(`${test.api}/${id}`));
  });
  test
    .withName(`should support searching ${test.api} by reference`)
    .withOptions({ qs: { where: `search ='${code}'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.reference === `${code}`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
