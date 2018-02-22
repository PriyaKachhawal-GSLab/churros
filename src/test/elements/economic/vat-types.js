'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');

suite.forElement('erp', 'vat-types', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test
     .withOptions({ qs: { where: `name = 'Salg udenfor EU' ` } })
     .withName('should support Ceql name search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.name = 'Salg udenfor EU');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();

     it('should support SR for /vat-types/:id/vat-report-setups', () => {
       let Vid;
       return cloud.get(`${test.api}`)
         .then(r => {
           Vid = r.body[0].id;
         })
         .then(r => cloud.get(`${test.api}/${Vid}/vat-report-setups`));

     });
});
