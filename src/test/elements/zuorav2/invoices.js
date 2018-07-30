'use strict';

const suite = require('core/suite');
const payload = require('./assets/invoices');
const customerPayload = require('./assets/customers');
const chakram = require('chakram');
const subscriptionPayload = require('./assets/subscriptions');
const tools = require('core/tools');
const cloud = require('core/cloud');
const build = (overrides) => Object.assign({}, payload, overrides);
const invoicesPayload = build({ CreditCardAddress1: tools.random() });

suite.forElement('payment', 'invoices', { payload: invoicesPayload }, (test) => {
  let customerId, rateId, charge;
  const options = {
    churros: {
      updatePayload: {
        "Status": "Canceled"
      }
    }
  };
  const ceqlOptions = {
    name: "should support CreatedDate > {date} Ceql search",
    qs: { where: 'CreatedDate>\'2017-02-22T08:21:00.000Z\'' }
  };

  let subscriptionId;
  before(done => {
    return cloud.get(`/subscriptions`)
      .then(r => subscriptionId = r.body[0].id)
      .then(r => cloud.get(`subscriptions/${subscriptionId}`))
      .then(r => {
        rateId = r.body.ratePlans[0].productRatePlanId;
        charge = r.body.ratePlans[0].ratePlanCharges[0].productRatePlanChargeId;
        subscriptionPayload.subscribeToRatePlans[0].productRatePlanId = rateId;
        subscriptionPayload.subscribeToRatePlans[0].chargeOverrides[0].productRatePlanChargeId = charge;
      })
      .then(r => cloud.post(`/hubs/payment/customers`, customerPayload))
      .then(r => customerId = r.body.id ? r.body.id : r.body.accountId)
      .then(r => subscriptionPayload.accountKey = customerId)
      .then(r => cloud.post(`/hubs/payment/subscriptions`, subscriptionPayload))
      .then(r => invoicesPayload.AccountId = customerId)
      .then(r => done());
  });
  test.should.supportNextPagePagination(2);
  test.withName(ceqlOptions.name).withOptions(ceqlOptions).should.return200OnGet();
  test.withOptions(options).should.supportCruds(chakram.put);
  after(() => cloud.delete(`/hubs/payment/customers/${customerId}`));
});
