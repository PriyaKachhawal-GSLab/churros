'use strict';

const suite = require('core/suite');
const payload = require('./assets/subscriptions');
const tools = require('core/tools');
const customerPayload = require('./assets/customers');
const cloud = require('core/cloud');
const chakram = require('chakram');
suite.forElement('payment', 'subscriptions', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "notes": tools.random()
      }
    }
  };
  const ceqlOptions = {
    name: "should support CreatedDate > {date} Ceql search",
    qs: { where: 'CreatedDate>\'2017-02-22T08:21:00.000Z\'' }
  };

  let rateId, subscriptionId, charge, customerId;
  before(() => {
    return cloud.get(`/subscriptions`)
      .then(r => subscriptionId = r.body[0].id)
      .then(r => cloud.get(`subscriptions/${subscriptionId}`))
      .then(r => {
        rateId = r.body.ratePlans[0].productRatePlanId;
        charge = r.body.ratePlans[0].ratePlanCharges[0].productRatePlanChargeId;
        payload.subscribeToRatePlans[0].productRatePlanId = rateId;
        payload.subscribeToRatePlans[0].chargeOverrides[0].productRatePlanChargeId = charge;
      })
      .then(r => cloud.post(`/hubs/payment/customers`, customerPayload))
      .then(r => customerId = r.body.id)
      .then(r => payload.accountKey = customerId);
  });

  test.withName(ceqlOptions.name).withOptions(ceqlOptions).should.return200OnGet();
  test.should.supportNextPagePagination(2);
  test.withOptions(options).should.supportCruds(chakram.put);



  it.skip(`should allow POST ${test.api}/preview `, () => {
    const previewPayload = {
      "contractEffectiveDate": "2015-1-15",
      "initialTerm": 12,
      "initialTermPeriodType": "Week",
      "previewAccountInfo": {
        "billCycleDay": 31,
        "billToContact": {
          "city": "Walnut Creek",
          "country": "United States",
          "county": "Contra Consta",
          "state": "California",
          "zipCode": "94549"
        },
        "currency": "USD"
      },
      "subscribeToRatePlans": [{
        "chargeOverrides": [{
          "productRatePlanChargeId": "c3ae26226860f5ef425eeafff8efd36a"
        }],
        "productRatePlanId": "c3ae2622721fc3a6c82eeebc7b386798"
      }],
      "termType": "TERMED"
    };
    previewPayload.subscribeToRatePlans[0].productRatePlanId = rateId;
    previewPayload.subscribeToRatePlans[0].chargeOverrides[0].productRatePlanChargeId = charge;
    return cloud.post(`${test.api}/preview`, previewPayload);
  });

  it.skip(`should allow PUT ${test.api}/{id}/renew `, () => {
    let id;
    const renewUpdatePayload = {
      "collect": false,
      "invoice": true
    };
    return cloud.post(`${test.api}`, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.put(`${test.api}/${id}/renew`, renewUpdatePayload));

  });
  it.skip(`should allow PUT ${test.api}/{id}/cancel`, () => {
    let id;
    const cancleUpdatePayload = {
      "cancellationEffectiveDate": "2015-01-31",
      "cancellationPolicy": "SpecificDate",
      "collect": false,
      "invoice": true
    };
    return cloud.post(`${test.api}`, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.put(`${test.api}/${id}/cancel`, cancleUpdatePayload));

  });
  it.skip(`should allow PUT ${test.api}/{id}/suspend and ${test.api}/{id}/resume `, () => {
    let id, idNew;
    const suspendUpdatePayload = {
      "suspendPolicy": "Today"
    };
    const resumeUpdatePayload = {
      "resumePolicy": "SpecificDate",
      "resumeSpecificDate": "2018-11-23"
    };
    return cloud.post(`${test.api}`, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.put(`${test.api}/${id}/suspend`, suspendUpdatePayload))
      .then(r => idNew = r.body.subscriptionId)
      .then(r => cloud.put(`${test.api}/${idNew}/resume`, resumeUpdatePayload));
  });


  after(() => cloud.delete(`/hubs/payment/customers/${customerId}`));
});
