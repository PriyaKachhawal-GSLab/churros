'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('marketing', 'contacts', null, (test) => {
  test.withOptions({ qs: { where: 'query=\'brody@cloud-elements.com\'' } })
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.email_address == 'brody@cloud-elements.com');
    expect(validValues.length).to.equal(r.body.length);
  })
  .should.return200OnGet();
});
