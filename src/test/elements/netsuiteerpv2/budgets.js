'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('erp', 'budgets', {skip: true}, (test) => {

  it('should allow SRUD for hubs/erp/budgets and CEQL search', () => {
    let budgetId;
	let payload = {};
    return cloud.get(`${test.api}`)
      .then(r => budgetId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `id=${budgetId}` } }).get(`${test.api}`))
      .then(r => {
      expect(r).to.statusCode(200);
      expect(r.body.length).to.be.equal(1);
    })
      .then(r => cloud.get(`${test.api}/${budgetId}`))
      .then(r => cloud.patch(`${test.api}/${budgetId}`, payload))
      .then(r => cloud.delete(`${test.api}/${budgetId}`));
  });
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
});
