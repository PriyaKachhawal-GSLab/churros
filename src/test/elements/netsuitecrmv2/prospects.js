'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/prospects.json`);
const expect = require('chakram').expect;

suite.forElement('crm', 'prospects', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { where: `internalId in (80,78,1)` }})
  .withValidation(r => {
  expect(r).to.statusCode(200);
  const validValues = r.body.filter(obj => obj.id.indexOf('80','78','1'));
  expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
  test.should.supportCeqlSearch('id');
});
