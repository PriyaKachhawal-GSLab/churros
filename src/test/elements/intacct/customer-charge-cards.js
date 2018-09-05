'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const customerPayload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const payload = tools.requirePayload(`${__dirname}/assets/customerChargeCards.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/customerChargeCardsUpdate.json`);

suite.forElement('finance', 'customer-charge-cards', { payload: payload }, (test) => {
  let customerId;
  before(() => cloud.post('/hubs/finance/customers', customerPayload)
    .then(r => customerId = r.body.id)
    .then(r => payload.customerid = customerId));

  it(`should allow CUD for ${test.api}`, () => {
    let cardId;
    return cloud.post(test.api, payload)
      .then(r => cardId = r.body.customerChargeCardsid)
      .then(r => cloud.patch(`${test.api}/${cardId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${cardId}`));
  });

  after(() => cloud.delete(`/hubs/finance/customers/${customerId}`));
});
