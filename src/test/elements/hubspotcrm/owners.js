'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('crm', 'owners', (test) => {
  test.should.supportS();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: `email = 'email@address.com'` } })
    .withName('should support email search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.email = 'email@address.com');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
