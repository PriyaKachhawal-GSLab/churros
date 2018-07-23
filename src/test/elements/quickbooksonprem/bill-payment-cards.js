'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
<<<<<<< HEAD
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = require('./assets/bill-payment-cards');
const updatePayload = { "Memo": tools.random() };
=======
const payload = require('./assets/bill-payment-cards-create');
const updatePayload = require('./assets/bill-payment-cards-update');
>>>>>>> master

//Pagination is not working from Element
suite.forElement('finance', 'bill-payment-cards', null, (test) => {
  it('should support SRD for /hubs/finance/bill-payment-cards', () => {
    let id;
    let refno;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        refno = r.body.RefNumber;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2018-05'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});