'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/bills-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/bills-update.json`);


suite.forElement('finance', 'bills', { payload: payload }, (test) => {

  it(`should support CRUDS and Ceql searching for ${test.api}`, () => {
    let id, editseq, isPaid, refno;
    return cloud.post(test.api, payload)
      .then(r => {
        editseq = r.body.EditSequence;
        id = r.body.id;
        updatePayload.EditSequence = r.body.EditSequence;
        refno = r.body.RefNumber;
      })
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `RefNumber='${refno}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
