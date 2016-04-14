'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const order = () => ({
  line_items: [{
    title: tools.random(),
    price: tools.randomInt()
  }]
});
const createFulfillment = (lineId) => ({
  "fulfillment": {
    "tracking_number": tools.random(),
    "line_items": [{
      "id": lineId
    }]
  }
});
const updateFulfillment = (fulfillmentId) => ({
  "fulfillment": {
    "tracking_number": tools.random(),
    "id": fulfillmentId
  }
});
suite.forElement('ecommerce', 'fulfillments', { payload: createFulfillment({}) }, (test) => {
  let orderId, lineId, fulfillmentId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order())
    .then(r => orderId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}`))
    .then(r => lineId = r.body.line_items[0].id)
    .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/fulfillments`, createFulfillment(lineId)))
    .then(r => fulfillmentId = r.body.id)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments-count`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments-count`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}`)
  });
  it(`should allow PATCH for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}`, () => {
    return cloud.patch(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}`, updateFulfillment(fulfillmentId))
  });
  it(`should allow PATCH for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}/status-cancel`, () => {
    return cloud.patch(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}/status-cancel`)
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}`);
  });
});
