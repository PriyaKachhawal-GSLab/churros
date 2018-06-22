'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/folders.json`);
const expect = require('chakram').expect;

suite.forElement('crm', 'folders', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { where: `internalId in (4,6,999)` }})
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.id.indexOf('4','6','999'));
  expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
  test.should.supportCeqlSearch('id');
});
