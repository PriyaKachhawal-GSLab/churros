'use strict';

const suite = require('core/suite');
const payload = require('./assets/customers');
const chakram = require('chakram');
const subscriptionPayload = require('./assets/subscriptions');
const tools = require('core/tools');
const cloud = require('core/cloud');
const paymentPayload = require('./assets/CustomerPaymentMethod');
const invoicePayload = require('./assets/customerInvoices');

suite.forElement('payment', 'customers', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "name": tools.random()
      }
    }
  };
  const ceqlOptions = {
    name: "should support CreatedDate > {date} Ceql search",
    qs: { where: 'CreatedDate>\'2017-02-22T08:21:00.000Z\'' }
  };

  let customerId, rateId, charge;
  before(() => {
    return cloud.withOptions({ qs: { where: 'expand=true' } }).get(`/hubs/payment/products`)
      .then(r => {
        var match = r.body.filter(function(list) {
          return list.productRatePlans.length !== 0;
        });
        if (match.length >= 0) {
          let rate = match[0].productRatePlans;
          rateId = rate[0].id;
          charge = rate[0].productRatePlanCharges[0].id;
          subscriptionPayload.subscribeToRatePlans[0].productRatePlanId = rateId;
          subscriptionPayload.subscribeToRatePlans[0].chargeOverrides[0].productRatePlanChargeId = charge;
        } else {
          // bail
        }
      });
  });

  test.withName(ceqlOptions.name).withOptions(ceqlOptions).should.return200OnGet();
  test.should.supportNextPagePagination(2, true);
  test.withOptions(options).should.supportCruds(chakram.put);


  it(`should allow CRUDS ${test.api}/id/payment-method`, () => {
    let paymentId;
    const paymentUpdatePayload = { "cardHolderName": "Leo" };
    return cloud.post(`/hubs/payment/customers`, payload)
      .then(r => customerId = r.body.id)
      .then(r => cloud.post(`${test.api}/${customerId}/payment-methods`, paymentPayload))
      .then(r => paymentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${customerId}/payment-methods`))
      .then(r => cloud.put(`${test.api}/${customerId}/payment-methods/${paymentId}`, paymentUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${customerId}/payment-methods/${paymentId}`));

  });


  it(`should allow GET ${test.api}/id/history,GET ${test.api}/id/payments`, () => {
    return cloud.get(`${test.api}/${customerId}/history`);
  });
  it(`GET ${test.api}/id/payments`, () => {
    return cloud.get(`${test.api}/${customerId}/payments`);
  });
  it.skip(`should allow CS for ${test.api}/id/subscriptions `, () => {
    return cloud.post(`${test.api}/${customerId}/subscriptions`, subscriptionPayload)
      .then(r => cloud.get(`${test.api}/${customerId}/subscriptions`));
  });
  it.skip(`should allow CS for ${test.api}/id/invoices `, () => {
    return cloud.post(`${test.api}/${customerId}/invoices`, invoicePayload)
      .then(r => cloud.get(`${test.api}/${customerId}/invoices`));
  });
  after(() => cloud.delete(`${test.api}/${customerId}`));
});
