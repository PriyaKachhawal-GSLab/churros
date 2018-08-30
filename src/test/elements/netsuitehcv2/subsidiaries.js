'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('humancapital', 'subsidiaries', (test) => {
  	test.should.supportS();
	  test.withOptions({ qs: { page: 1, pageSize: 5}}).should.supportPagination();
    test
      .withOptions({ qs: { where: `email = 'test@gamil.com' ` } })
      .withName('should support Ceql email search')
      .withValidation(r => {
        expect(r).to.statusCode(200);
        const validValues = r.body.filter(obj => obj.email >= 'test@gamil.com');
        expect(validValues.length).to.equal(r.body.length);
      })
      .should.return200OnGet();
});
