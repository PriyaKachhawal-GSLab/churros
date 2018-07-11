'use strict';
const cloud = require('core/cloud');
const suite = require('core/suite');
const expect = require('chakram').expect;
suite.forElement('finance', 'credit-terms', (test) => {
  test.should.supportSr();
  test
    .withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name='1% 10 Net 30'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name === `1% 10 Net 30`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportNextPagePagination(1);
  
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400))
  });
  it(`should return an error when 'active' filter is not true or false`, () => {
    return cloud.withOptions({qs: {where: `active='isNotTrueOrFalse'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400))
  });
});
