'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/bills.json`);

const update = (editseq, isPaid) => ({
  "EditSequence": editseq,
  "IsPaid": isPaid
});

suite.forElement('finance', 'bills', { payload: payload }, (test) => {

  it(`should support CRUDS and Ceql searching for ${test.api}`, () => {
    let id, editseq, isPaid, refno;
    return cloud.post(test.api, payload)
      .then(r => {
        editseq = r.body.EditSequence;
        isPaid = r.body.IsPaid;
        id = r.body.id;
        refno = r.body.RefNumber;
      })
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2018-05'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, update(editseq, isPaid)))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400))
  });
});
