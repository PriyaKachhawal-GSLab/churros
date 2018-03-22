const suite = require('core/suite');
const cloud = require('core/cloud');
const noFields = require('core/tools').requirePayload(`${__dirname}/assets/nofield-definition.json`);
const expect = require('chai').expect;
const R = require('ramda');
const common = require('../formulas/assets/common');
const commonResourceFormula = require('../formulas/assets/formulas/formula-with-common-resource');

const orgCommonResource = {
  name: 'foo',
  fields: [{
    path: 'id',
    type: 'number'
  }, {
    path: 'name',
    type: 'string'
  }]
};

suite.forPlatform('common-resources', {}, () => {
  const orgUrl = `/organizations/objects/${orgCommonResource.name}/definitions`;
  const api = '/common-resources';
  let formulaId;
  before(() => {
    cloud.post(orgUrl, orgCommonResource)
    .then(common.createFormula(commonResourceFormula))
    .then(r => formulaId = r.body.id)
  });

  it('should support returning all common resources that exist', () => {
    const v = r => {
      expect(r.response.statusCode).to.equal(200);
      expect(r.body).to.be.an('array');

      // find newly created common resource and validate the fields
      const newCr = R.find(R.propEq('name', orgCommonResource.name))(r.body);
      expect(newCr.fields).to.be.an('array').and.have.length(2);
      expect(newCr.fields.filter(field => field.associatedLevel === 'organization')).to.have.length(2);
    };

    return cloud.get(api, v);
  });

  it('should support PUT, GET, DELETE common resources with no fields', () => {
    return cloud.put(api, noFields)
      .then(r => cloud.get(`${api}/${noFields.name}`))
      .then(r => cloud.delete(`${api}/${noFields.name}`));
  });

  it('should support finding usages in formulas', () => {
    const validation = r => {
      const usage = r.body.formulaUsages
      expect(r.body).to.haveOwnProperty('formulaUsages')
      expect(usage).to.have.length.gte(1)
      expect(usage[0]).to.haveOwnProperty('formulaName')
      expect(usage[0]).to.haveOwnProperty('formulaId')
      expect(usage[0]).to.haveOwnProperty('usageCount')
      expect(usage[0]).property('usageCount').to.eq(2)
    }
    return cloud.get(`${api}/MyContact/usages`, validation)
  })

  after(() => {
    cloud.delete(orgUrl)
    .then(common.deleteFormula(formulaId))
  });
});
