'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const createFulfillment = tools.requirePayload(`${__dirname}/assets/OrdersFulfillments-create.josn`);
const updateFulfillment = tools.requirePayload(`${__dirname}/assets/OrfersFulfillments-update.json`);
const order = tools.requirePayload(`${__dirname}/assets/orders-create.json`);

suite.forElement('ecommerce', 'fulfillments', { payload: createFulfillment }, (test) => {
  let orderId, lineId, fulfillmentId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order)
    .then(r => orderId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}`))
    .then(r => lineId = r.body.line_items[0].id)
    .then(r => createFulfillment.fulfillment.line_items[0].id = lineId)
    .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/fulfillments`, createFulfillment))
    .then(r => fulfillmentId = r.body.id)
    .then(r => updateFulfillment.fulfillment.id = fulfillmentId)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments-count`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments-count`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}`);
  });
  it(`should allow PATCH for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}`, () => {
    return cloud.patch(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}`, updateFulfillment);
  });
  it(`should allow PATCH for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}/status-cancel`, () => {
    return cloud.patch(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}/status-cancel`);
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}`);
  });
});
