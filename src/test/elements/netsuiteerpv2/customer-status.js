'use strict';

const suite = require('core/suite');
const payload = require('./assets/customer-status');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('erp', 'customer-status', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  it('should CEQL search', () => {
    let statusId;
	let payload = {};
    return cloud.get(`${test.api}`)
      .then(r => statusId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `id=${statusId}` } }).get(`${test.api}`))
      .then(r => {
      expect(r).to.statusCode(200);
      expect(r.body.length).to.be.equal(1);
    });
  });
});
