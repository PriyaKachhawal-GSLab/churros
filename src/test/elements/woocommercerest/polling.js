'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const productsPayload = tools.requirePayload(`${__dirname}/assets/products.json`);
const customersPayload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const ordersPayload = tools.requirePayload(`${__dirname}/assets/orders.json`);
const discountsPayload = tools.requirePayload(`${__dirname}/assets/discounts.json`);

suite.forElement('ecommerce', 'polling', null, (test) => {
  test.withApi('/hubs/ecommerce/products').should.supportPolling(productsPayload, 'products');
  test.withApi('/hubs/ecommerce/customers').should.supportPolling(customersPayload, 'customers');
  test.withApi('/hubs/ecommerce/orders').should.supportPolling(ordersPayload, 'orders');
  test.withApi('/hubs/ecommerce/discounts').should.supportPolling(discountsPayload, 'discounts');
});
