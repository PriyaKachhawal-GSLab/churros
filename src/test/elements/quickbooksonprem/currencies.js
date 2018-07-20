'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

const payload = require('./assets/currencies-create');
const updatePayload = require('./assets/currencies-update');


suite.forElement('finance', 'currencies', { payload: payload }, (test) => {
  it(`should support CRUDS and Ceql searching for ${test.api}`, () => {
    let id, editseq;
    return cloud.post(test.api, payload)
      .then(r => {
        updatePayload.EditSequence = r.body.EditSequence;
        id = r.body.id;
      })
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
