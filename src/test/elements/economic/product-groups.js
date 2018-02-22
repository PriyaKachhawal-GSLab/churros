'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

const expect = require('chakram').expect;


suite.forElement('erp', 'product-groups', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test
     .withOptions({ qs: { where: `name = 'Ydelser m/moms' ` } })
     .withName('should support Ceql name search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.name = 'Ydelser m/moms');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();
     it('should support S for /product-groups/:id/sales-accounts', () => {
       let id;
       return cloud.get(`${test.api}`)
         .then(r => {
           id = r.body[0].id;
         })
         .then(r => cloud.get(`${test.api}/${id}/sales-accounts`));
     });

});
