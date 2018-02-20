'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/item-receipts');
const purchaseOrder = require('./assets/purchase-orders');
const expect = require('chakram').expect;

suite.forElement('erp', 'item-receipts', { payload: payload }, (test) => {
  it('should allow CUD for hubs/erp/item-receipts', () => {
    let purchaseOrderId;
	let itemReceiptId;
    return cloud.post('hubs/erp/purchase-orders', purchaseOrder)
      .then(r => purchaseOrderId = r.body.id)
      .then(r => payload.createdFrom.internalId = purchaseOrderId)
      .then(r => cloud.post(`${test.api}`, payload))
      .then(r => itemReceiptId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${itemReceiptId}`, payload))
      .then(r => cloud.delete(`${test.api}/${itemReceiptId}`))
      .then(r => cloud.delete(`hubs/erp/purchase-orders/${purchaseOrderId}`));
  });
 /* test.should.supportSr();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test
    .withOptions({ qs: { where: `lastModifiedDate >= '2014-01-15T00:00:00.000Z'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.lastModifiedDate).getTime() >= 1389744000000); //2014-01-15T00:00:00.000Z7 is equivalent to 1389744000000
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
	*/
});
