const suite = require('core/suite');
const cloud = require('core/cloud');
const noFields = require('core/tools').requirePayload(`${__dirname}/assets/nofield-definition.json`);
const expect = require('chai').expect;
const R = require('ramda');
const tools = require('core/tools');

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
  before(() => cloud.post(orgUrl, orgCommonResource));

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

  after(() => cloud.delete(orgUrl));
});
