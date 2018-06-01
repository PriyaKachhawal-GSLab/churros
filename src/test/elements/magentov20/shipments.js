'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const productPayload = require('./assets/products');
const orderPayload = require('./assets/orders');
const payload = require('./assets/shipments');
const expect = require('chakram').expect;
const shipmentTrack = (parentId, orderId) => ({
  "entity": {
    "carrier_code": "flatrate",
    "order_id": orderId,
    "parent_id": parentId,
    "track_number": "ce" + tools.randomInt()
  }
});

suite.forElement('ecommerce', 'shipments', { payload: payload }, (test) => {
  let attributeSetId, orderId, sku, parentId, comment;

  it(`should allow CRS for ${test.api}`, () => {
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
        orderPayload.cartItem.sku = sku;
      })
      .then(r => cloud.post(`/hubs/ecommerce/orders`, orderPayload))
      .then(r => orderId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}`))
      .then(r => {
        payload.billing_address_id = r.body.billing_address_id;
        payload.entity_id = r.body.entity_id;
        payload.customer_id = r.body.customer_id;
        payload.order_id = orderId;
        payload.items[0].parent_id = r.body.items[0].parent_id;
        payload.items[0].order_item_id = orderId;
        payload.items[0].product_id = r.body.items[0].product_id;
        payload.items[0].name = r.body.items[0].name;
        payload.items[0].sku = sku;
      })
      .then(r => cloud.post(test.api, payload))
      .then(r => {
        parentId = r.body.items[0].parent_id;
      })
      .then(r => cloud.post(`/hubs/ecommerce/shipments-track`, shipmentTrack(parentId, orderId)))
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${parentId}`))
      .then(r => {
        comment = { "entity": { "parent_id": parentId, "comment": "Mycomment" } };
      })
      .then(r => cloud.post(`${test.api}/${parentId}/comments`, comment))
      .then(r => cloud.get(`${test.api}/${parentId}/comments`))
      .then(r => cloud.get(`${test.api}/${parentId}/label`))
      // Need to change the parentId here as the latest created shipment does not work for POST /emails.
      // One previously created Id only works.
      .then(r => {
        parentId = parentId - 1;
      })
      .then(r => cloud.post(`${test.api}/${parentId}/emails`, parentId))
      .then(r => cloud.delete(`/hubs/ecommerce/products/${sku}`))
      .then(r => cloud.delete(`/hubs/ecommerce/orders/${orderId}`));
  });
  test
    .withName(`should support searching ${test.api} by entity_id`)
    .withOptions({ qs: { where: `entity_id='${parentId}'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.entity_id === parentId);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportPagination();
});
