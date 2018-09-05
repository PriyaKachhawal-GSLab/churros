const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const tools = require('core/tools');
const noFields = tools.requirePayload(`${__dirname}/assets/nofield-definition.json`);
const simpleDefinition = tools.requirePayload(`${__dirname}/assets/simple-definition.json`);
const basicTransformation = require('./assets/basic-transformation');
const changedFields = tools.requirePayload(`${__dirname}/assets/changed-fields-definition.json`);
const expect = require('chai').expect;
const R = require('ramda');
const common = require('../formulas/assets/common');
const commonResourceFormula = require('../formulas/assets/formulas/formula-with-common-resource');
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
  let formulaId, closeioId, elementId, accountId, orgId;
  before(() => cloud.post(orgUrl, orgCommonResource)
    .then(() => common.createFormula(commonResourceFormula))
    .then(r => formulaId = r.id)
    .then(() => cloud.get('/organizations/me'))
    .then(r => orgId = r.body.id)
    .then(() => cloud.get('/accounts'))
    .then(r => accountId = r.body[0].id)
    .then(() => provisioner.create('closeio'))
    .then(r => {
      closeioId = r.body.id;
      elementId = r.body.element.id;
    })
  );
  after(() => cloud.delete(orgUrl)
    .then(common.deleteFormula(formulaId))
    .then(() => provisioner.delete(closeioId))
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
    return cloud.put(api, noFields, r => expect(r).to.have.statusCode(201))
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
  function updateFields(obj, path) {
    const options = {organization: orgId, account: accountId, instance: closeioId};
    const cb = arr => arr.map(f => Object.assign({}, f, {associatedId: options[f.associatedLevel]}));
    return R.over(R.lensProp(path), cb, obj);
  }
  it('should support PUT with changed fields', () => {
    const overRidden = {name: simpleDefinition.name, elementInstanceIds: [closeioId], mappedElementIds: [elementId]};
    const transformations = Object.assign({}, basicTransformation, overRidden, {objectName: simpleDefinition.name, elementInstanceId: closeioId});
    return cloud.put(api, simpleDefinition, r => expect(r).to.have.statusCode(201))
      .then(r => cloud.put('/transformations', transformations))
      .then(r => cloud.put(api, updateFields(Object.assign({}, changedFields, overRidden), 'fields')))
      .then(r => cloud.get(`${api}/${simpleDefinition.name}`))
      .then(r => cloud.get(`/instances/${closeioId}/transformations/${simpleDefinition.name}`))
      .then(r => expect(r.body.fields.map(t => t.path).sort()).to.deep.equals(['accId2', 'instId2', 'orgId2']))
      .then(r => cloud.delete(`/instances/${closeioId}/transformations/${simpleDefinition.name}?propagate=true`))
      .then(r => cloud.delete(`${api}/${simpleDefinition.name}`));
  });

});
