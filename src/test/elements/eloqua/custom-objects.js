'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload =  {
    "name": tools.randomStr('abcdefghijklmnopqrstuvwxyz11234567890', 10)
};

suite.forElement('marketing', 'custom-objects', { payload: payload }, (test) => {

  it(`should allow CRUDS for ${test.api}`, () => {
    let id;
    const updatePayload = {
        "name": tools.randomStr('abcdefghijklmnopqrstuvwxyz11234567890', 10)
    };

    return cloud.get(test.api)
      .then(r => cloud.post(test.api, payload))
      .then(r => {
        id = r.body.id;
      })
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.put(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
