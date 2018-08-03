'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'purchasing-transaction-definitions', (test) => {
  const modifiedDate = '08/22/2016 18:50:11';
  it(`should allow SR for ${test.api}`, () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].RECORDNO)
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(2, false);
  test.withOptions({ qs: { where: `WHENMODIFIED ='${modifiedDate}'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = modifiedDate);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
