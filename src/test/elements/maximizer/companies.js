'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const companyPayload = tools.requirePayload(`${__dirname}/assets/company.json`);

suite.forElement('crm', 'companies', { payload : companyPayload }, (test) => {
  let companyId;
  test.should.supportPagination("id");
  test.should.supportCruds();

  before(() =>
    cloud.post(test.api, companyPayload)
    .then(r => companyId = r.body.id));

  after(() => cloud.delete(`${test.api}/${companyId}`));

  test.withApi(test.api)
      .withOptions({ qs: { where: `CompanyName='${companyPayload.CompanyName}'`, fields: `CompanyName,FullName` } })
      .withValidation(r => {
         expect(r.body.filter(obj => expect(r.body[0].CompanyName).to.equal(companyPayload.CompanyName))).to.not.be.empty;
         expect(Object.keys(r.body[0]).length).to.equal(2);
      })
      .withName('should allow GET with options /companies')
      .should.return200OnGet();
});
