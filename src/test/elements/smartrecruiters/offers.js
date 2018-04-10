'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('humancapital', 'offers', { }, (test) => {

  test.should.supportS();
  test.should.supportPagination(1);
  test.withOptions({ qs: { where: `createdAfter = '2018-02-26T12:50:02.594+0000' ` } })
    .withName('should support Ceql createdAfter search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.createdOn >= '2018-02-26T12:50:02.594+0000');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
