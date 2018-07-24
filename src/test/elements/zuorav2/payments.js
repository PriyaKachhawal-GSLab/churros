'use strict';

const suite = require('core/suite');
const payload = require('./assets/payments');
const customerPayload = require('./assets/customers');
const cloud = require('core/cloud');
const InvoicePayload = require('./assets/invoices');
const subscriptionPayload = require('./assets/subscriptions');
const paymentMethodPayload = require('./assets/paymentMethod');
const chakram = require('chakram');
suite.forElement('payment', 'payments', { payload: payload }, (test) => {
  let rateId, charge;
  const options = {
    churros: {
      updatePayload: {
        "Status": "Voided"
      }
    }
  };
  let customerId, subscriptionId, invoiceId,sId,pId;
  const date = subscriptionPayload.contractEffectiveDate;
  InvoicePayload.InvoiceDate = date;
  InvoicePayload.TargetDate = date;
  const ceqlOptions = {
    name: "should support CreatedDate > {date} Ceql search",
    qs: { where: 'CreatedDate>\'2017-02-22T08:21:00.000Z\'' }
  };
  const updateInvoicePayload = { "Status": "Posted" };
  before(() => {
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
      .then(r => sId = r.body.id)
      .then(r => InvoicePayload.AccountId = customerId)
      .then(r => cloud.post(`/hubs/payment/invoices`, InvoicePayload))
      .then(r => invoiceId = r.body.id)
      .then(r => cloud.put(`/hubs/payment/invoices/${invoiceId}`, updateInvoicePayload))
      .then(r => paymentMethodPayload.AccountId = customerId)
      .then(r => cloud.post(`/hubs/payment/payment-methods`, paymentMethodPayload))
      .then(r => pId = r.body.id)
      .then(r => payload.PaymentMethodId = pId)
      .then(r => payload.AccountId = customerId)
      .then(r => payload.InvoiceId = invoiceId);
  });
  test.withName(ceqlOptions.name).withOptions(ceqlOptions).should.return200OnGet();
  test.should.supportNextPagePagination(2);
  test.withOptions(options).should.supportCruds(chakram.put);
  after(() => cloud.delete(`/hubs/payment/customers/${customerId}`));




});
