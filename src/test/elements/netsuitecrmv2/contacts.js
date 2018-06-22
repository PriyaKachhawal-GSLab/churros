'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/contacts.json`);
const expect = require('chakram').expect;

suite.forElement('crm', 'contacts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: `internalId in (4,6,1)`}})
  .withValidation(r => {expect(r).to.statusCode(200);
  const validValues = r.body.filter(obj => obj.id.indexOf('4','6','1'));
  expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
  test.should.supportCeqlSearch('id');
});
