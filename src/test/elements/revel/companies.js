const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const companyPayload = tools.requirePayload(`${__dirname}/assets/company.json`);
const companyUpdatePayload = tools.requirePayload(`${__dirname}/assets/companyUpdate.json`);

suite.forElement('employee', 'companies', (test) => {

  test.should.supportPagination();

  before(() => cloud.get('/users')
    .then(r => {
      companyPayload.created_by = r.body[0].resource_uri;
      companyPayload.updated_by = r.body[0].resource_uri;
    })
  );

  test.should.supportPagination();

  it('Should allow CRU for Comapanies', () => {
    let companyId;
    return cloud.post(test.api, companyPayload)
      .then(r => companyId = r.body.id)
      .then(r => cloud.get(`${test.api}/${companyId}`))
      .then(r => cloud.patch(`${test.api}/${companyId}`, companyUpdatePayload))
      .then(r => cloud.get(test.api))
      .then(r => expect(r.body).to.not.to.be.empty);
  });
});