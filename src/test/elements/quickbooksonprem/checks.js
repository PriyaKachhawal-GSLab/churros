'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/checks-create');
const updatePayload = require('./assets/checks-update');
suite.forElement('finance', 'checks', { payload: payload }, (test) => {
  it('should support CRUDS, pagination and Ceql searching for ${test.api}', () => {
    let id, refno;
    return cloud.post(test.api, payload)
      .then(r => { id = r.body.TxnID;
        //console.log(id)
        refno = r.body.RefNumber; })   
      return cloud.get(test.api)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.RefNumber === `${refno}`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2018-01'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => updatePayload.TxnID = r.body.TxnID)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(3);
  test.should.supportPagination('TxnID');
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({ qs: { where: `TimeModified='2018'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});