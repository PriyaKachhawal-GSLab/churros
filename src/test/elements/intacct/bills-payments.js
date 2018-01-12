'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

// Posting a new bills-payment (AP payment) goes to confirmed state. Delete and update on a confirmed AP payment is not allowed by Intacct
suite.forElement('finance', 'bills-payments', (test) => {
  test.should.supportSr();
  test
    .withOptions({ qs: { where: `STATE = 'C'` } })
    .withName('should support Ceql search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.STATE = 'C');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
