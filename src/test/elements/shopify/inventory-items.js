'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('ecommerce', 'inventory-items', (test) => {

  const updatePayload = () => ({
    "sku": "new sku",
    "tracked": true
  });

  let itemId;
  it('should allow Get and Patch for /hubs/marketing/inventory-items', () => {
    return cloud.withOptions({ qs: { where: 'ids=2517889862' } }).get(`${test.api}`)
      .then(r => itemId = r.body[0].id)
      .then(r => cloud.patch(`${test.api}/${itemId}`, updatePayload()));
  });
});
