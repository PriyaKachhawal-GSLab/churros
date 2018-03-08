'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('messaging', 'accounts', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test
     .withOptions({ qs: { where: `FriendlyName = 'Jack' AND Status='suspended'` } })
     .withName('should support Ceql FriendlyName search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.friendly_name = 'Jack' && obj.status === 'suspended');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();
});
