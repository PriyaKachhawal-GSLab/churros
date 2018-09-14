'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const refund = tools.requirePayload(`${__dirname}/assets/ordersPayments-create.json`);
const order = tools.requirePayload(`${__dirname}/assets/orders-create.json`);

suite.forElement('ecommerce', 'payments', (test) => {
  let orderId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order)
    .then(r => orderId = r.body.id)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/payments`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/payments`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/payments-count`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/payments-count`);
  });
  it(`should allow POST for /hubs/ecommerce/orders/{orderId}/payments to capture`, () => {
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/payments`, refund);
  });
  it(`should allow POST for /hubs/ecommerce/orders/{orderId}/payments to refund`, () => {
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/payments`, refund);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/payments/{paymentId}`, () => {
    let paymentId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/payments`, refund)
      .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/payments`, refund))
      .then(r => paymentId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}/payments/${paymentId}`));
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}`);
  });
});
