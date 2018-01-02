'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

const updateProduct = (productName) => ({
  "name": productName,
  "description": tools.random()
});

suite.forElement('payment', 'products', (test) => {
  test.withOptions({ qs: { where: 'direction=\'desc\''}}).should.return200OnGet();
  it(`should allow RU for ${test.api}`, () => {
    let productId;
    let productName;
    return cloud.get(`${test.api}`)
      .then(r => productId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${productId}`))
      .then(r => productName = r.body.product.name)
      .then(r => cloud.patch(`${test.api}/${productId}`, updateProduct(productName)));
  });
  test.should.supportPagination();
});
