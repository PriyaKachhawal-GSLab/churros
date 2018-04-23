'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('crm', 'orders', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'since=\'2018-03-22T03:13:41.000-04:00\'' } })
    .withName('should support search by created_date')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.creation_date = '2018-03-22T03:13:41.000-04:00');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

  it('should support S for /orders/id/transactions', () => {
    let orderId;
    return cloud.get(test.api)
      .then(r => {
        orderId = r.body.id;
      })
      .then(r => cloud.get(`${test.api}/${orderId}/transactions`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1, page: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: 'since=\'2018-03-22T03:13:41.000-04:00\'' } }).get(test.api));
  });
});