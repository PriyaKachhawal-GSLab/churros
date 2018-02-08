const suite = require('core/suite');
const cloud = require('core/cloud');
const noFields = require('core/tools').requirePayload(`${__dirname}/assets/nofield-definition.json`);
const expect = require('chai').expect;
const R = require('ramda');

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

  after(() => cloud.delete(orgUrl));
});
