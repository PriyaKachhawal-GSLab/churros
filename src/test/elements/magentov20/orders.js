'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const productPayload = require('./assets/products');
const ordersInvoicePayload = require('./assets/ordersInvoice');
const payload = require('./assets/orders');
const expect = require('chakram').expect;

suite.forElement('ecommerce', 'orders', { payload: payload }, (test) => {
  let attributeSetId, comments, sku, orderId, orderPutPayload, addressPayload, protectCode;

  it(`should allow CRUDS for ${test.api}`, () => {
    return cloud.get(`/hubs/ecommerce/products-attribute-sets`)
      .then(r => {
        attributeSetId = r.body[0].id;
        productPayload.product.attribute_set_id = attributeSetId;
       productPayload.product.name = tools.random();
        productPayload.product.sku = "ce" + tools.randomInt();
      })
      .then(r => cloud.post(`/hubs/ecommerce/products`, productPayload))
      .then(r => {
        sku = r.body.sku;
        payload.cartItem.sku = sku;
      })
      .then(r => cloud.post(test.api, payload))
      .then(r => {
        orderId = r.body.id;
        protectCode = r.body.protect_code;
      })
      .then(r => cloud.get(`${test.api}/${orderId}`))
      .then(r => {
        addressPayload = r.body.billing_address;
        addressPayload.firstname = "ce-first";
        addressPayload.lastname = "ce-last";
        orderPutPayload = { "entity": addressPayload };
      })
      .then(r => cloud.put(`${test.api}/${orderId}`, orderPutPayload))
      .then(r => cloud.get(test.api))
      .then(r => comments = { "statusHistory": { "comment": "comments" } })
      .then(r => cloud.post(`${test.api}/${orderId}/comments`, comments))
      .then(r => cloud.get(`${test.api}/${orderId}/comments`))
      .then(r => cloud.post(`${test.api}/${orderId}/emails`, orderId))
      .then(r => cloud.post(`${test.api}/${orderId}/invoice`, ordersInvoicePayload))
      .then(r => cloud.post(`${test.api}/${orderId}/hold`, orderId))
      .then(r => cloud.get(`${test.api}/${orderId}/statuses`))
      .then(r => cloud.post(`${test.api}/${orderId}/unhold`, orderId))
      .then(r => cloud.post(`${test.api}/${orderId}/cancel`, orderId))
      .then(r => cloud.get(`/hubs/ecommerce/orders-items`))
      .then(r => cloud.get(`hubs/ecommerce/orders-items/${orderId}`))
      .then(r => cloud.delete(`/hubs/ecommerce/products/${sku}`))
      .then(r => cloud.delete(`${test.api}/${orderId}`)); //internally mapped with POST/order{id}/cancel
  });
  test
    .withName(`should support searching ${test.api} by protect_code AND base_total_due`)
    .withOptions({ qs: { where: `protect_code='${protectCode}'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.protect_code === protectCode);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
    test.withOptions(protectCode).should.supportPagination;
});
