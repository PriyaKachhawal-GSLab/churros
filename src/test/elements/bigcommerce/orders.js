'use strict';

const suite = require('core/suite');
const payload = require('./assets/orders');
const cloud = require('core/cloud');

const ordersUpdate = () => ({
  "customer_message": "Update",
  "payment_method": "Manual"
});

const options = {
  churros: {
    updatePayload: ordersUpdate()
  }
};

const shipmentsCreate = (addressId, productId) => ({
  "items": [{
    "quantity": 1,
    "order_product_id": productId
  }],
  "comments": "TestThis",
  "tracking_number": "EJ958083578US",
  "order_address_id": addressId
});

const shipmentsUpdate = () => ({
  "comments": "UpdateThis"
});
/*  orders with Sales Tax Calculation set to 'automatic' in Vendor account are not allowed to be deleted
    Hence skip the tests if Tax calculation = 'automatic'
*/
suite.forElement('ecommerce', 'orders', { payload: payload}, (test) => {
  test.withOptions(options).should.supportCruds();
  /* updated the where query from  'fetchShippingAddresses=\'true\'' to
     'email=\'jamesjiffer@jiffylube.org\'' as fetchShippingAddresses field not present in
    response and vendor response is failing with 504 Gateway Time-out error
  */
  test.withOptions({ qs: { where: 'email=\'jamesjiffer@jiffylube.org\'' } }).should.return200OnGet();
  test.withApi(`${test.api}/count`).should.return200OnGet();
  test.withApi(`${test.api}/products/count`).should.return200OnGet();
  test.withApi(`${test.api}/shipments/count`).should.return200OnGet();
  test.withApi(`${test.api}/statuses`).should.supportSr();
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('payment_method');

  let orderId = -1;
  before(() => cloud.post(test.api, payload)
    .then(r => orderId = r.body.id)
    .then(r => cloud.patch(`${test.api}/${orderId}`, ordersUpdate()))
  );
  it('should allow SR for orders/addresses', () => {
    let addressId = -1;
    return cloud.get(`${test.api}/${orderId}`)
      .then(r => cloud.get(`${test.api}/${orderId}/addresses`))
      .then(r => addressId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${orderId}/addresses/${addressId}`));
  });
  it('should allow SR for orders/products', () => {
    let productId = -1;
    return cloud.get(`${test.api}/${orderId}`)
      .then(r => cloud.get(`${test.api}/${orderId}/products`))
      .then(r => productId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${orderId}/products/${productId}`));
  });
  it('should allow S for orders/coupons, orders/comments, and orders/taxes', () => {
    return cloud.get(`${test.api}/${orderId}`)
      .then(r => cloud.get(`${test.api}/${orderId}/coupons`))
      .then(r => cloud.get(`${test.api}/${orderId}/comments`))
      .then(r => cloud.get(`${test.api}/${orderId}/taxes`));
  });
  it('should support CRUDS for orders/shipments', () => {
    let addressId = -1;
    let productId = -1;
    let shipmentId = -1;
    return cloud.get(`${test.api}/${orderId}`)
      .then(r => cloud.get(`${test.api}/${orderId}/addresses`))
      .then(r => addressId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${orderId}/products`))
      .then(r => productId = r.body[0].id)
      .then(r => cloud.post(`${test.api}/${orderId}/shipments`, shipmentsCreate(addressId.toString(), productId.toString())))
      .then(r => shipmentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${orderId}/shipments`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${orderId}/shipments`))
      .then(r => cloud.get(`${test.api}/${orderId}/shipments/${shipmentId}`))
      .then(r => cloud.patch(`${test.api}/${orderId}/shipments/${shipmentId}`, shipmentsUpdate()))
      .then(r => cloud.get(`${test.api}/${orderId}/shipments/count`))
      //For delete orders to be success ,Sales Tax Calculation should be set to 'manual' in the vendor account
      .then(r => cloud.delete(`${test.api}/${orderId}/shipments/${shipmentId}`));
  });
  it('should support search for orders/{id}/transations', () => {
    return cloud.get(`${test.api}/${orderId}/transactions`);
  });
  after(() => cloud.delete(`${test.api}/${orderId}`));

});
