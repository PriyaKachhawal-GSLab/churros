'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/LocationsInventoryItems-update.json`);

suite.forElement('ecommerce', 'inventory-items', (test) => {
  it('should allow Get and Patch for /hubs/marketing/inventory-items', () => {
    let locationId, inventoryitemId, itemId;
    return cloud.get(`/locations`)
      .then(r => locationId = r.body[0].id)
      .then(r => cloud.get(`/locations/${locationId}/inventory-levels`))
      .then(r => inventoryitemId = r.body[0].inventory_item_id)
      .then(r => cloud.withOptions({ qs: { where: `ids='${inventoryitemId}'` } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `ids='${inventoryitemId}'`, page: 1, pageSize: 1 } }).get(`${test.api}`))
      .then(r => itemId = r.body[0].id)
      .then(r => cloud.patch(`${test.api}/${itemId}`, payload));
  });
});
