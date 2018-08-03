'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'item-groups', (test) => {
  it(`should allow SR for ${test.api}`, () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].RECORDNO)
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(2);
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
