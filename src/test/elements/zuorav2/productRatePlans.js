'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('payment', 'product-rate-plans', (test) => {
  test.should.return200OnGet();
  test.should.supportNextPagePagination(2);
  test
    .withName(`should support searching ${test.api} by CreatedDate`)
    .withOptions({ qs: { where: 'CreatedDate=\'2018-06-18T02:51:51.000-07:00\'' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.CreatedDate === '2018-06-18T02:51:51.000-07:00');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
