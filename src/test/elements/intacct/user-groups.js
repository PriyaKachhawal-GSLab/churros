'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'user-groups', (test) => {
  const modifiedDate = '08/06/2018 05:32:09';
  it(`should allow SR for ${test.api}`, () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].RECORDNO)
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `WHENMODIFIED ='${modifiedDate}'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = modifiedDate);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
