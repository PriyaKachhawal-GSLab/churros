'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const createAddress= require('./assets/address-create.json');
const createAddress= require('./assets/address-update.json');

const customer = () => ({
  "first_name": tools.random(),
  "last_name": tools.random(),
  "email": tools.randomEmail()
});
/*const createAddress = () => ({
 // "zip": tools.random()
});*/

/*const updateAddress = (addressId) => ({
  "id": addressId,
  "zip": tools.random()
});*/

suite.forElement('ecommerce', 'addresses', (test) => {
  let customerId;
  before(() => cloud.post(`/hubs/ecommerce/customers`,customer())
    .then(r => customerId = r.body.id)
  );
  it(`should allow GET for /hubs/ecommerce/customers/{customerId}/addresses`, () => {
    return cloud.get(`/hubs/ecommerce/customers/${customerId}/addresses`);
  });
  it(`should allow GET for /hubs/ecommerce/customers/{customerId}/addresses/{addressId}`, () => {
    let addressId;
    return cloud.post(`/hubs/ecommerce/customers/${customerId}/addresses`,createAddress())
    .then(r => addressId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`))
    .then(r => cloud.post(`/hubs/ecommerce/customers/${customerId}/addresses`,createAddress()))
    .then(r => addressId = r.body.id)
    .then(r => cloud.delete(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`));
  });
  it(`should allow PATCH for /hubs/ecommerce/customers/{customerId}/addresses/{addressId}`, () => {
    let addressId;
    return cloud.post(`/hubs/ecommerce/customers/${customerId}/addresses`,createAddress())
    .then(r => addressId = r.body.id)
    .then(r => cloud.patch(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`,updateAddress(addressId)))
    .then(r => cloud.delete(`/hubs/ecommerce/customers/${customerId}/addresses/${addressId}`));
  });
  it(`should allow DELETE for /hubs/ecommerce/customers/{customerId}`, () => {
    return cloud.delete(`/hubs/ecommerce/customers/${customerId}`);
  });
});
