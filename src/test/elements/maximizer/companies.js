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
  .withName(`should support nested search i.e.,  filter by where with multiple options using and`)
  .withOptions({ qs: { where: `CompanyName='3BLASIUS COMPANY' and Address.City='Denver'` } })
  .withValidation(r => {
    expect(r.body.filter(obj => obj.Address.City === `Denver`));
    expect(r.body.filter(obj => obj.CompanyName === `3BLASIUS COMPANY`));
  })
  .should.return200OnGet();

  test.withApi(test.api)
      .withOptions({ qs: { where: `CompanyName='${companyPayload.CompanyName}'`, fields: `CompanyName,FullName` } })
      .withValidation(r => {
         expect(r.body.filter(obj => obj.CompanyName === companyPayload.CompanyName).length).to.equal(r.body.length);
         expect(Object.keys(r.body[0]).length).to.equal(2);
      })
      .withName('should allow GET with options /companies')
      .should.return200OnGet();
  
});
