'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('humancapital', 'users', { }, (test) => {

  test.should.supportS();
  test.should.supportPagination(1);
  test.withOptions({ qs: { where: `updatedAfter = '2018-02-26T12:50:02.594+0000' ` } })
    .withName('should support Ceql updatedAfter search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.updatedOn >= '2018-02-26T12:50:02.594+0000');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
