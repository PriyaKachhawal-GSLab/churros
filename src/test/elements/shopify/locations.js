'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const inventoryItemPayload = tools.requirePayload(`${__dirname}/assets/locationsInventoryItems-update.json`);
const inventorylevelPayload = tools.requirePayload(`${__dirname}/assets/locationsInventoryLevels-create.json`);
const updateInventoryLevelpayload = tools.requirePayload(`${__dirname}/assets/locationsInventoryLevels-update.json`);

suite.forElement('ecommerce', 'locations', (test) => {
  let locationId, itemId;
  before(() =>
    cloud.get(`${test.api}`)
    .then(r => locationId = r.body[0].id)
    .then(r => cloud.get(`${test.api}/${locationId}/inventory-levels`))
    .then(r => itemId = r.body[0].inventory_item_id));

  it('should allow CRU for /hubs/marketing/locations/${id}/inventory-items/${itemId}/inventory-levels', () => {
    return cloud.get(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`)
      .then(r => cloud.patch(`inventory-items/${itemId}`, inventoryItemPayload))
      .then(r => cloud.patch(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`, updateInventoryLevelpayload))
      .then(r => cloud.post(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`, inventorylevelPayload))
      .then(r => cloud.post(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`));
  });

  it(`should support pagination for ${test.api}/{id}/inventory-levels`, () => {
    return cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${locationId}/inventory-levels`)
      .then(r => {
        expect(r.body.length).to.equal(1);
      });
  });

  it(`should support pagination for ${test.api}/{id}/inventory-items/${itemId}/inventory-levels`, () => {
    return cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${locationId}/inventory-items/${itemId}/inventory-levels`)
      .then(r => {
        expect(r.body.length).to.equal(1);
      });
  });
});
