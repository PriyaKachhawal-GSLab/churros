const suite = require('core/suite');
const cloud = require('core/cloud');
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

  before(() => cloud.post(orgUrl, orgCommonResource));

  it('should support returning all common resources that exist', () => {
    const v = r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.be.an('array');

      // find newly created common resource and validate the fields
      const newCr = R.find(R.propEq('name', orgCommonResource.name))(r.body);
      expect(newCr.fields).to.be.an('array').and.have.length(2);
      expect(newCr.fields.filter(field => field.associatedLevel === 'organization')).to.have.length(2);
    };

    return cloud.get('/common-resources', v);
  });

  after(() => cloud.delete(orgUrl));
});
