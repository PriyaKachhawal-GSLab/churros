'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const productsPayload = require('./assets/products');
const build = (overrides) => Object.assign({}, productsPayload, overrides);
const updatePayload = build({ handle: tools.random() });

suite.forElement('payment', 'product-families', (test) => {
  let productFamilyId;
  const payload = {
    "name": "churros name",
    "description": "churros description",
    "handle": tools.random()
  };
  test.withOptions({ qs: { where: 'direction=\'desc\'' } }).should.return200OnGet();
  it(`should allow SR for ${test.api}/{productFamilyId} and S for ${test.api}/{productFamilyId}/Products`, () => {
    return cloud.post(test.api, payload)
      .then(r => cloud.get(test.api))
      .then(r => productFamilyId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${productFamilyId}`))
	  .then(r => cloud.get(`${test.api}/${productFamilyId}/products`));
  });
  // skipping because no delete API is present for prdocuts resource
  it.skip(`should allow POST for ${test.api}/{productFamilyId}/products`, () => {
    return cloud.post(`${test.api}/${productFamilyId}/products`, updatePayload);
  });
  test.should.supportPagination();
});
