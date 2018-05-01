const suite = require('core/suite');
const cloud = require('core/cloud');
const noFields = require('core/tools').requirePayload(`${__dirname}/assets/nofield-definition.json`);
const expect = require('chai').expect;
const R = require('ramda');
const common = require('../formulas/assets/common');
const commonResourceFormula = require('../formulas/assets/formulas/formula-with-common-resource');
const tools = require('core/tools');
const {filter} = require('ramda');

const orgCommonResource = {
  name: `foo-${tools.random()}`,
  fields: [{
    path: 'id',
    type: 'number'
  }, {
    path: 'name',
    type: 'string'
  }]
};

const orgCommonResourceTwo = {
  name: `foo-${tools.random()}`,
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
  before(() => cloud.post(orgUrl, orgCommonResource)
    .then(() => common.createFormula(commonResourceFormula))
    .then(r => formulaId = r.id)
  );

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
      const usage = r.body.formulaUsages;
      expect(r.body).to.haveOwnProperty('formulaUsages');
      expect(usage).to.have.length.gte(1);
      expect(usage[0]).to.haveOwnProperty('formulaName');
      expect(usage[0]).to.haveOwnProperty('formulaId');
      expect(usage[0]).to.haveOwnProperty('usageCount');
      expect(filter(n => n.usageCount === 3, usage)).length.to.be.gte(1);
    };
    return cloud.get(`${api}/MyContact/usages`, validation);
  });

  after(() => cloud.delete(orgUrl)
    .then(common.deleteFormula(formulaId))
  );

  it('should support renaming common resources', () => {
    const newName = `${orgCommonResourceTwo.name}-rename`;
    const renamePayload ={
      name: newName
    };

    const validation = r => {
      const response = r.body;
      expect(response).to.be.an('object');
      expect(response.name).to.eq(newName);
      expect(response.fields).to.be.an('array').and.have.length(2);
    };

    const checkOldDoesntExist = r => {
      expect(r.response.statusCode).to.eq(404);
    };

    return cloud.post(`/organizations/objects/${orgCommonResourceTwo.name}/definitions`, orgCommonResourceTwo)
      .then(r => cloud.patch(`${api}/${orgCommonResourceTwo.name}`,renamePayload))
      .then(r => cloud.get(`${api}/${newName}`, validation))
      .then(r => cloud.get(`${api}/${orgCommonResourceTwo.name}`,checkOldDoesntExist))
      .then(r => cloud.delete(`${api}/${newName}`));
  });
});
