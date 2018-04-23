'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

const updateProduct = (productName) => ({
  "name": productName,
  "description": tools.random()
});

suite.forElement('payment', 'products', (test) => {
  it(`should allow RU for ${test.api}`, () => {
    let productId = 3802547;
    let productName;
    // no GET /products API is available and deleting existing products is not allowed
    return cloud.get(`${test.api}/${productId}`)
      .then(r => productName = r.body.product.name)
      .then(r => cloud.patch(`${test.api}/${productId}`, updateProduct(productName)));
  });
});
