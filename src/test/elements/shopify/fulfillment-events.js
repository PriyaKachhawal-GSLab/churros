'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/fulfillmentEvents-status.json`);
const createFulfillment = tools.requirePayload(`${__dirname}/assets/fulfillments-create.json`);
const order = tools.requirePayload(`${__dirname}/assets/orders-create.json`);

suite.forElement('ecommerce', 'fulfillment-events', { payload: payload }, (test) => {
  let orderId, lineId, fulfillmentId, eventId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order)
    .then(r => orderId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}`))
    .then(r => lineId = r.body.line_items[0].id)
    .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/fulfillments`, createFulfillment))
    .then(r => fulfillmentId = r.body.id)
    .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}/fulfillment-events`, payload))
    .then(r => eventId = r.body.id)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}/fulfillment-events`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}/fulfillment-events`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}/fulfillment-events/{eventId}`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}/fulfillment-events/${eventId}`);
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}/fulfillments/{fulfillmentId}/fulfillment-events/{eventId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}/fulfillments/${fulfillmentId}/fulfillment-events/${eventId}`);
  });
  after(() => cloud.delete(`/hubs/ecommerce/orders/${orderId}`));

});
