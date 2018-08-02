'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'payment-methods', null, (test) => {
  it('should support SR and pagination for /hubs/finance/payment-methods', () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test
    .withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name  ='05jvatrmfgb6dhrggb9'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name === `05jvatrmfgb6dhrggb9`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportPagination();
});
