'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const capture = require('./assets/payment-create.json');

const order = () => ({
  "line_items": [
    {
      "title": tools.random(),
      "price": tools.randomInt(),
      "grams": "1300",
      "quantity": 3,
      "requires_shipping": true,
      "tax_lines": [
        {
          "price": tools.randomInt(),
          "rate": tools.randomInt(),
          "title": tools.random()
        }
      ]
    }
  ],
  "transactions": [
    {
      "kind": "authorization",
      "status": "success",
      "amount": tools.randomInt()
    }
  ],
  "total_tax": tools.randomInt(),
  "currency": "EUR"
});
const calculateRefund = (lineId) => ({
  "refund": {
    "shipping": {
      "full_refund": true
    },
    "refund_line_items": [
      {
        "line_item_id": lineId,
        "quantity": 3
      }
    ]
  }
});
const refund = (lineId, parentId) => (
 {
    "restock": true,
    "note": tools.randomInt(),
    "shipping": {
      "full_refund": true
    },
    "refund_line_items": [
      {
        "line_item_id": lineId,
        "quantity": 3
      }
    ],
    "transactions": [
      {
        "parent_id": parentId,
        "amount": 10,
        "kind": "refund",
        "gateway": "bogus"
      }
    ]
  }
);

suite.forElement('ecommerce', 'refunds', {skip: false}, (test) => {
  let orderId, lineId;
  before(() => cloud.post(`/hubs/ecommerce/orders`, order())
    .then(r => orderId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}`))
    .then(r => lineId = r.body.line_items[0].id)
  );
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/refunds`, () => {
    return cloud.get(`/hubs/ecommerce/orders/${orderId}/refunds`);
  });
  it(`should allow POST for /hubs/ecommerce/orders/{orderId}/payments`, () => {
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/payments`, capture);
  });
  it(`should allow POST for /hubs/ecommerce/orders/{orderId}/refunds-calculate`, () => {
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/refunds-calculate`, calculateRefund(lineId));
  });
  it(`should allow GET for /hubs/ecommerce/orders/{orderId}/refunds/{refundId}`, () => {
    let parentId, refundId;
    return cloud.post(`/hubs/ecommerce/orders/${orderId}/refunds-calculate`, calculateRefund(lineId))
    .then(r => parentId = r.body.transactions[0].parent_id)
    .then(r => cloud.post(`/hubs/ecommerce/orders/${orderId}/refunds`, refund(lineId,parentId)))
    .then(r => refundId = r.body.id)
    .then(r => cloud.get(`/hubs/ecommerce/orders/${orderId}/refunds/${refundId}`));
  });
  it(`should allow DELETE for /hubs/ecommerce/orders/{orderId}`, () => {
    return cloud.delete(`/hubs/ecommerce/orders/${orderId}`);
  });
});
