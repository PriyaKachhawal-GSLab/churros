'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const capture = tools.requirePayload(`${__dirname}/assets/ordersPayments-create.json`);
const order = tools.requirePayload(`${__dirname}/assets/orders-create.json`);
const calculateRefund = tools.requirePayload(`${__dirname}/assets/ordersRefundsCalculate-create.json`);
const refund = tools.requirePayload(`${__dirname}/assets/ordersRefunds-create.json`);

suite.forElement('ecommerce', 'refunds', { skip: false }, (test) => {
  let orderId, lineId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order)
    .then(r => orderId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}`))
    .then(r => lineId = r.body.line_items[0].id)
    .then(r => calculateRefund.refund.refund_line_items[0].line_item_id = lineId)
    .then(r => refund.refund_line_items[0].line_item_id = lineId)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/refunds`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/refunds`);
  });
  it(`should allow POST for /hubs/ecommerce/orders/{orderId}/payments`, () => {
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/payments`, capture);
  });
  it(`should allow POST for /hubs/ecommerce/orders/{orderId}/refunds-calculate`, () => {
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/refunds-calculate`, calculateRefund);
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/refunds/{refundId}`, () => {
    let parentId, refundId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/refunds-calculate`, calculateRefund)
      .then(r => parentId = r.body.transactions[0].parent_id)
      .then(r => refund.transactions[0].parent_id = parentId)
      .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/refunds`, refund))
      .then(r => refundId = r.body.id)
      .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}/refunds/${refundId}`));
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}`);
  });
});
