'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
<<<<<<< HEAD
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/credit-memos.json`);
const update = (editseq) => ({
  "EditSequence": editseq,
  "SalesTaxTotal": 0
});
=======
const payload = require('./assets/credit-memos-create');
const updatePayload = require('./assets/credit-memos-update');
>>>>>>> master

suite.forElement('finance', 'credit-memos', { payload: payload }, (test) => {
  it('should support CRUDS, pagination and Ceql searching for ${test.api}', () => {
    let id,refno;
    return cloud.post(test.api, payload)
      .then(r => { id = r.body.id; refno = r.body.RefNumber; })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
<<<<<<< HEAD
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2018-01'` } }).get(test.api))
=======
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
>>>>>>> master
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });  
});