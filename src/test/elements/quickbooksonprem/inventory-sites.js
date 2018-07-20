'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/inventory-sites-create');
const updatePayload = require('./assets/inventory-sites-update');

suite.forElement('finance', 'inventory-sites', { payload: payload }, (test) => {
  it('should support CRUDS, pagination for /hubs/finance/inventory-sites', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
});
