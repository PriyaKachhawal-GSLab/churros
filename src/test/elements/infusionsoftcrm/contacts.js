'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = require('./assets/contacts');

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  test.should.supportCrud();
  test.withOptions({ qs: { where: 'Email=\'senior.churros@cloud-elements.com\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.Email = 'senior.churros@cloud-elements.com');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
