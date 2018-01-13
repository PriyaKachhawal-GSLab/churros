'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

// Posting a new bills-payment (AP payment) goes to confirmed state. Delete and update on a confirmed AP payment is not allowed by Intacct
suite.forElement('finance', 'bills-payments', (test) => {
  test.should.supportSr();
  test
    .withOptions({ qs: { where: `WHENMODIFIED = '06/23/2013 14:25:17'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED === '06/23/2013 14:25:17');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
