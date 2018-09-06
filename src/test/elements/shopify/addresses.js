'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const customer = tools.requirePayload(`${__dirname}/assets/customers-create.json`);
const createAddress = tools.requirePayload(`${__dirname}/assets/address-create.json`);
const createAddress2 = tools.requirePayload(`${__dirname}/assets/address-create.json`);
const createAddress3 = tools.requirePayload(`${__dirname}/assets/address-create.json`);
const updateAddress = tools.requirePayload(`${__dirname}/assets/address-update.json`);


suite.forElement('ecommerce', 'addresses', (test) => {
  let customerId;
  before(() => cloud.post(`/hubs/ecommerce/customers`, customer)
    .then(r => customerId = r.body.id)
  );
  it(`should allow GET for /hubs/ecommerce/customers/{customerId}/addresses`, () => {
    return cloud.get(`/hubs/ecommerce/customers/${customerId}/addresses`);
  });
  it(`should allow GET for /hubs/ecommerce/customers/{customerId}/addresses/{addressId}`, () => {
    let addressId;
    return cloud.post(`/hubs/ecommerce/customers/${customerId}/addresses`, createAddress)
      .then(r => addressId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`))
      .then(r => cloud.post(`/hubs/ecommerce/customers/${customerId}/addresses`, createAddress2))
      .then(r => addressId = r.body.id)
      .then(r => cloud.delete(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`));
  });
  it(`should allow PATCH for /hubs/ecommerce/customers/{customerId}/addresses/{addressId}`, () => {
    let addressId;
    return cloud.post(`/hubs/ecommerce/customers/${customerId}/addresses`, createAddress3)
      .then(r => addressId = r.body.id)
      .then(r => updateAddress.id = addressId)
      .then(r => cloud.patch(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`, updateAddress))
      .then(r => cloud.delete(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`));
  });
  it(`should allow DELETE for /hubs/ecommerce/customers/{customerId}`, () => {
    return cloud.delete(`/hubs/ecommerce/customers/${customerId}`);
  });
});
