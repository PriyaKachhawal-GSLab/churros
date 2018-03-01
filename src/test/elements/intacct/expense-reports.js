'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/expense-reports.json`);
const exepensePatch = tools.requirePayload(`${__dirname}/assets/expense-report-patch.json`);
suite.forElement('finance', 'expense-reports', { payload: payload }, (test) => {
  it(`should allow CRDS for ${test.api}`, () => {
    return cloud.crds(test.api, payload);
  });
  it(`should allow PATCH for ${test.api}/{id}`, () => {
    let expenseId;
    return cloud.post(test.api, tools.requirePayload(`${__dirname}/assets/expense-reports.json`))
      .then(r => expenseId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${expenseId}`, exepensePatch))
      .then(r => cloud.delete(`${test.api}/${expenseId}`));
  });
  test.should.supportPagination();
  test
     .withOptions({ qs: { where: `batchkey = 187 ` } })
     .withName('should support Ceql batchKey search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.batchkey === 187 );
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();
});
