'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const riskCreate = require('./assets/risk-create.json');
const riskUpdate1 = require('./assets/risk-update.json');
const order = require('./assets/orders-create.json');
/*const order = () => ({
  "line_items": [{
    "title": tools.random(),
    "price": tools.randomInt()
  }],
  "transactions": [{
    "kind": "authorization",
    "status": "success",
    "amount": tools.randomInt()
  }]
});*/
const riskUpdate = (riskId) => ({
  "id": riskId,
riskUpdate1
  /*"message": tools.random(),
  "recommendation": "accept",
  "source": "External",
  "cause_cancel": false,
  "score": 0.0*/
});

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
    .then(r => cloud.patch(`/hubs/ecommerce/orders/${orderId}/risks/${riskId}`, riskUpdate(riskId)))
    .then(r => cloud.delete(`/hubs/ecommerce/orders/${orderId}/risks/${riskId}`));
  });
});
