'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/credit-memos.json`);
const update = (editseq) => ({
  "EditSequence": editseq,
  "SalesTaxTotal": 0
});

suite.forElement('finance', 'credit-memos', { payload: payload }, (test) => {
  it(`should support CRUDS and Ceql searching for ${test.api}`, () => {
    let id, editseq, refno;
    return cloud.post(test.api, payload)
      .then(r => {
        editseq = r.body.EditSequence;
        id = r.body.id;
        refno = r.body.RefNumber;
      })
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2018-01'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, update(editseq)))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });  
});