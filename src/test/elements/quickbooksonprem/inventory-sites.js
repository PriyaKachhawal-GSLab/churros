'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/inventory-sites-create');
const updatePayload = require('./assets/inventory-sites-update');

suite.forElement('finance', 'inventory-sites', { payload: payload }, (test) => {
  it('should support CRUDS, pagination for /hubs/finance/inventory-sites', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `isactive='true'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.IsActive === `true`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(2);
  test.should.supportPagination('id');
});
