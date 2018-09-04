'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

// Skipping this test as there are no permissions to retrieve Roles
suite.forElement('finance', 'roles',{ skip: true }, (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(2);
  it('should CEQL search with RECORDNO', () => {
    let recordNo;
    return cloud.get(test.api)
      .then(r => recordNo = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `RECORDNO=${recordNo}` } }).get(test.api))
      .then(r => {
        expect(r).to.statusCode(200);
        expect(r.body.length).to.be.equal(1);
      });
  });
});
