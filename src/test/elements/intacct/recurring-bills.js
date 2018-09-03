'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/recurring-bills-create.json`);
const vendorPayload = tools.requirePayload(`${__dirname}/assets/vendor.json`);

suite.forElement('finance', 'recurring-bills', { payload: payload }, (test) => {
  let vendorId;
  before(() => cloud.post('/hubs/finance/vendors', vendorPayload)
    .then(r => vendorId = r.body.id)
    .then(r => payload.vendorid = vendorId));

  test.should.supportCrds();
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
  after(() => cloud.delete(`/hubs/finance/vendors/${vendorId}`));
});
