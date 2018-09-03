'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const payload=require('./assets/metafields-create.json');
const updatePayload=require('./assets/metafields-update.json');
const order =require('./assets/orders-create');

/*const order = () => ({
  line_items: [{
    title: tools.random(),
    price: tools.randomInt()
  }]
});*/
suite.forElement('ecommerce', 'metafields', { payload: payload, skip: false }, (test) => {
  const objectName = 'order';
  let orderId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order)
    .then(r => orderId = r.body.id)
  );
  test.withJson(payload).should.supportCruds();
  test.withApi(`/hubs/ecommerce/metafields-count`).should.return200OnGet();
  it(`should allow GET for /hubs/ecommerce/{objectName}/{id}/metafields`, () => {
    return cloud.get(`/hubs/ecommerce/${objectName}/${orderId}/metafields`);
  });
  it(`should allow GET for /hubs/ecommerce/{objectName}/{id}/metafields-count`, () => {
    return cloud.get(`/hubs/ecommerce/${objectName}/${orderId}/metafields-count`);
  });
  it(`should allow GET for /hubs/ecommerce/{objectName}/{orderId}/metafields/{metafieldId}`, () => {
    let metafieldId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/metafields`,payload)
    .then(r => metafieldId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/${objectName}/${orderId}/metafields/${metafieldId}`))
    .then(r => cloud.delete(`/hubs/ecommerce/${objectName}/${orderId}/metafields/${metafieldId}`));
  });
  it(`should allow PATCH for /hubs/ecommerce/{objectName}/{orderId}/metafields/{metafieldId}`, () => {
    let metafieldId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/metafields`,payload)
    .then(r => metafieldId = r.body.id)
    .then(r => cloud.patch(`/hubs/ecommerce/orders/${orderId}/metafields/${metafieldId}`, updatePayload))
    .then(r => cloud.delete(`/hubs/ecommerce/${objectName}/${orderId}/metafields/${metafieldId}`));
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}`);
  });
});
