'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/products');
const build = (overrides) => Object.assign({}, payload, overrides);
const productPayload = build({
  item_code: "item" + tools.randomInt()
});

suite.forElement('finance', 'items', {
  payload: productPayload
}, (test) => {
  before(() => {
    return cloud.get(`/product-sales-price-types`)
      .then(r => productPayload.sales_prices[0].product_sales_price_type_id = r.body[0].id);
  });
  it('should get first page of items', () => {
    let productId;
    return cloud.post(`/products`, productPayload)
      .then(r => productId = r.body.id)
      .then(r => cloud.withOptions({
        qs: {
          page: 1,
          pageSize: 100
        }
      }).get(test.api))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body).to.not.be.null &&
        expect(r.body).to.be.a('array') && expect(r.body).to.have.length.above(0) &&
        expect(r.body[0]).to.contain.key('item_code') &&
        expect(r.body[0]).to.contain.key('id'))
      .then(r => cloud.delete(`/products/${productId}`));
  });

  it('should get item by id', () => {
    let productId;
    return cloud.post(`/products`, productPayload)
      .then(r => productId = r.body.id)
      .then(r => cloud.get(`${test.api}/${productId}`))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body).to.not.be.null &&
        expect(r.body).to.contain.key('item_code') &&
        expect(r.body).to.contain.key('id') &&
        expect(r.body.id).to.equal(productId))
      .then(r => cloud.delete(`/products/${productId}`));
  });
});
