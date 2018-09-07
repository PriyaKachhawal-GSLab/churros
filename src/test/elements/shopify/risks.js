'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const riskCreate = tools.requirePayload(`${__dirname}/assets/ordersRisks-create.json`);
const riskUpdate = tools.requirePayload(`${__dirname}/assets/ordersRisks-update.json`);
const order = tools.requirePayload(`${__dirname}/assets/orders-create.json`);

suite.forElement('ecommerce', 'risks', (test) => {
  let orderId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order)
    .then(r => orderId = r.body.id)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/risks`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/risks`);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/risks/{riskId}`, () => {
    let riskId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/risks`, riskCreate)
      .then(r => riskId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}/risks/${riskId}`))
      .then(r => cloud.delete(`/hubs/ecommerce/orders/${orderId}/risks/${riskId}`));
  });
  it(`should allow PATCH for /hubs/ecommerce/orders/{orderId}/risks/{riskId}`, () => {
    let riskId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/risks`, riskCreate)
      .then(r => riskId = r.body.id)
      .then(r => riskUpdate.id = riskId)
      .then(r => cloud.patch(`/hubs/ecommerce/orders/${orderId}/risks/${riskId}`, riskUpdate))
      .then(r => cloud.delete(`/hubs/ecommerce/orders/${orderId}/risks/${riskId}`));
  });
});
