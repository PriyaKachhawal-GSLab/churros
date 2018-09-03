'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/item-tax-groups-create.json`);

suite.forElement('finance', 'item-tax-groups', { payload: payload }, (test) => {
  it(`should allow CRDS for ${test.api}`, () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => cloud.get(test.api))
      .then(r => {
        id = r.body[0].RECORDNO;
      })
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.delete(`${test.api}/${payload.name}`));
  });
  test.should.supportNextPagePagination(1);
  it('should CEQL search with RECORDNO', () => {
    let recordNo;
    return cloud.get(test.api)
      .then(r => recordNo = r.body[0].RECORDNO)
      .then(r => cloud.withOptions({ qs: { where: `RECORDNO=${recordNo}` } }).get(test.api))
      .then(r => {
        expect(r).to.statusCode(200);
        expect(r.body.length).to.be.equal(1);
      });
  });
});
