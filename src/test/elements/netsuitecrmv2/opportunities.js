'use strict';

const suite = require('core/suite');
const payload = require('./assets/opportunities');
const expect = require('chakram').expect;

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: `internalId in (336,338,1)` }})
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.id.indexOf('336','338','1'));
    expect(validValues.length).to.equal(r.body.length);
  });
  test.should.supportCeqlSearch('id');
});
