'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/payroll-wage-items-create');

suite.forElement('finance', 'payroll-wage-items', { payload: payload }, (test) => {
  it('should support CRDS and pagination for /hubs/finance/payroll-wage-items', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.ListID)
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `isactive='true'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.IsActive === `true`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(2);
});
