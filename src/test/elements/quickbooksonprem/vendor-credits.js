'use strict';

const suite = require('core/suite');
const payload = require('./assets/vendor-credit');
const cloud = require('core/cloud');
const updatePayload = { "Memo": "Updated"};

suite.forElement('finance', 'vendor-credits', { payload: payload }, (test) => {
  it('should support CRUDS, pagination for /hubs/finance/vendor-credits', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
