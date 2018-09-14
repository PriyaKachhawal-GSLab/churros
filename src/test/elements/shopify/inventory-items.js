'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/inventory-items-update.json`);
const queryPayload = tools.requirePayload(`${__dirname}/assets/inventory-items-requiredQueryParam-r.json`);

suite.forElement('ecommerce', 'inventory-items', (test) => {
  it('should allow Get and Patch for /hubs/marketing/inventory-items', () => {
    let locationId, inventoryitemId, itemId;
    return cloud.get(`/locations`)
      .then(r => locationId = r.body[0].id)
      .then(r => cloud.get(`/locations/${locationId}/inventory-levels`))
      .then(r => inventoryitemId = r.body[0].inventory_item_id)
      .then(r => queryPayload.where=`ids='${inventoryitemId}'`)
      .then(r => queryPayload.page ="1")
      .then(r => queryPayload.pageSize="1")
      .then(r => cloud.withOptions({ qs: queryPayload }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: queryPayload }).get(`${test.api}`))
      .then(r => itemId = r.body[0].id)
      .then(r => cloud.patch(`${test.api}/${itemId}`, payload));
  });
});
