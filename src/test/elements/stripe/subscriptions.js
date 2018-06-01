'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const customer = require('./assets/customers');
const payload = require('./assets/subscriptions');

const createSubscription = (planId) => ({
  "plan": "gold"
});
const updateSubscription = () => ({
  "quantity": tools.randomInt()
});
const plan = () => ({
  "amount": tools.randomInt(),
  "interval": "month",
  "name": tools.random(),
  "currency": "usd",
  "id": tools.random()
});

suite.forElement('payment', 'subscriptions', { payload: payload }, (test) => {
  let customerId, planId;

  const opts = {
    churros: {
      updatePayload: {
        quantity: 2
      }
    }
  };
  test.should.supportNextPagePagination(2);
  test.withOptions(opts).should.supportCruds();

  before(() => cloud.post(`/hubs/payment/customers`, customer)
    .then(r => customerId = r.body.id)
    .then(r => cloud.post(`/hubs/payment/plans`, plan()))
    .then(r => planId = r.body.id)
  );

  it(`should allow CRUD for /hubs/payment/customers/{customerId}/subscriptions/{subscriptionId}`, () => {
    let subscriptionId;
    return cloud.post(`/hubs/payment/customers/${customerId}/subscriptions`, createSubscription(planId))
      .then(r => subscriptionId = r.body.id)
      .then(r => cloud.get(`/hubs/payment/customers/${customerId}/subscriptions/${subscriptionId}`))
      .then(r => cloud.patch(`/hubs/payment/customers/${customerId}/subscriptions/${subscriptionId}`, updateSubscription()))
      .then(r => cloud.delete(`/hubs/payment/customers/${customerId}/subscriptions/${subscriptionId}`));
  });

  after(() => cloud.delete(`/hubs/payment/customers/${customerId}`)
    .then(cloud.delete(`/hubs/payment/plans/${planId}`))
  );
});
