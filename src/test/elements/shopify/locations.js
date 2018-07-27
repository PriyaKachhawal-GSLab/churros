'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('ecommerce', 'locations', (test) => {

  const createPayload = () => ({
      "available": 42
  });

  const updatePayload = () => ({
      "available_adjustment": 5
  });

  const updateInventoryItemPayload = () => ({
    "tracked": true
  });

  let locationId,itemId;
  it('should allow CRUDS for /hubs/marketing/locations', () => {
    return cloud.get(`${test.api}`)
      .then(r => locationId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${locationId}/inventory-levels`))
      .then(r => itemId = r.body[0].inventory_item_id)
      .then(r => cloud.get(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`))
      .then(r => cloud.patch(`inventory-items/${itemId}`, updateInventoryItemPayload()))
      .then(r => cloud.patch(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`, updatePayload()))
      .then(r => cloud.post(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`, createPayload()))
      .then(r => cloud.post(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`))
      .then(r => cloud.delete(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`));
  });
});
