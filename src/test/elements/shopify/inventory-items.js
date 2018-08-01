'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('ecommerce', 'inventory-items', (test) => {

  const updatePayload = () => ({
    "sku": "new sku",
    "tracked": true
  });

  let locationId, inventoryitemId, itemId;
  it('should allow Get and Patch for /hubs/marketing/inventory-items', () => {
    return cloud.get(`/locations`)
    .then(r => locationId = r.body[0].id)
    .then(r => cloud.get(`/locations/${locationId}/inventory-levels`))
    .then(r => inventoryitemId = r.body[0].inventory_item_id)
    .then(r => cloud.withOptions({ qs: { where: `ids='${inventoryitemId}'` } }).get(`${test.api}`))
    .then(r => cloud.withOptions({ qs: { where: `ids='${inventoryitemId}'`, page : 1, pageSize: 1 } }).get(`${test.api}`))
    .then(r => itemId = r.body[0].id)
    .then(r => cloud.patch(`${test.api}/${itemId}`, updatePayload()));
  });
});
