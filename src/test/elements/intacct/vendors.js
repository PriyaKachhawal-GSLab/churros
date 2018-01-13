'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/vendor.json`);

suite.forElement('finance', 'vendors', { payload: payload }, (test) => {
  it(`should allow CRDS for ${test.api}`, () => {
    return cloud.crds(test.api, payload);
  });
  test.should.supportPagination();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();

  // Pre-DE586, Intacct returned whatever was requested for pageSize if above maxPage. Now, we should return substantially less...
  test
    .withName('should support paginated search and return less than requested')
    .withOptions({ qs: { pageSize: 1000 } })
    .withValidation(r => expect(r.body.length).to.be.equal(1000))
    .should.return200OnGet();
});
