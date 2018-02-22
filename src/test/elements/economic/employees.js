'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;


suite.forElement('erp', 'employees', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test
     .withOptions({ qs: { where: `email = 'test@gmail.com' ` } })
     .withName('should support Ceql email search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.email = 'test@gmail.com');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();
});
