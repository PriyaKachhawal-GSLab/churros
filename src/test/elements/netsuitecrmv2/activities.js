'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities');
const expect = require('chakram').expect;


suite.forElement('crm', 'activities', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: `internalId in (80,78,1,00)` }})
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.id.indexOf('80','78','1','00'));
    expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
  test.should.supportCeqlSearch('id');
});
