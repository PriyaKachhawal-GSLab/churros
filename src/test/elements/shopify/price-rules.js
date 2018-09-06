'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/priceRules-create.json`);
const discountPayload = tools.requirePayload(`${__dirname}/assets/discount-codes.json`);

suite.forElement('ecommerce', 'price-rules', { payload: payload }, (test) => {
  it(`should allow CRDS for ${test.api} and ${test.api}/:id/discount-codes`, () => {
    let priceRuleId, discountCodeId;
    return cloud.post(test.api, payload)
      .then(r => priceRuleId = r.body.id)
      .then(r => cloud.get(`${test.api}/${priceRuleId}`))
      .then(r => cloud.get(test.api))
      .then(r => cloud.post(`${test.api}/${priceRuleId}/discount-codes`, discountPayload))
      .then(r => discountCodeId = r.body.id)
      .then(r => cloud.get(`${test.api}/${priceRuleId}/discount-codes/${discountCodeId}`))
      .then(r => cloud.get(`${test.api}/${priceRuleId}/discount-codes`))
      .then(r => cloud.get(`/discount-codes/${discountPayload.code}`))
      .then(r => expect(r.body).to.not.be.empty)
      .then(r => cloud.delete(`${test.api}/${priceRuleId}/discount-codes/${discountCodeId}`))
      .then(r => cloud.delete(`${test.api}/${priceRuleId}`));
  });
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
