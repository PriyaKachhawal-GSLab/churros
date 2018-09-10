'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/accounts-update.json`);
const propertiesPayload = tools.requirePayload(`${__dirname}/assets/accountsProperties-create.json`);
const fieldsUpdate = tools.requirePayload(`${__dirname}/assets/accountsProperties-update.json`);
const propertygroups = tools.requirePayload(`${__dirname}/assets/accountsPropertygroups-create.json`);
const updatePropertygroups = tools.requirePayload(`${__dirname}/assets/accountsPropertygroups-update.json`);

suite.forElement('marketing', 'accounts', { payload: payload }, (test) => {
  let propertyGroupName;
  before(() => cloud.get(`${test.api}/propertygroups`)
    .then(r => propertyGroupName = r.body[0].name)
    .then(r => propertiesPayload.groupName = propertyGroupName));

  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();

  it('should allow CRUDS for hubs/marketing/accounts/properties', () => {
    propertiesPayload.name = propertiesPayload.name.toLowerCase();
    let id;
    return cloud.post(`${test.api}/properties`, propertiesPayload)
      .then(r => {
        id = r.body.name;
        expect(r.body).to.not.be.empty;
      })
      .then(r => cloud.get(`${test.api}/properties`))
      .then(r => cloud.get(`${test.api}/properties/${id}`))
      .then(r => cloud.patch(`${test.api}/properties/${id}`, fieldsUpdate))
      .then(r => cloud.delete(`${test.api}/properties/${id}`));
  });
  test.withApi(`${test.api}/properties`)
    .withName('should allow pagination for accounts/properties with page and nextPage')
    .should.supportNextPagePagination(2);

  it('should allow CUDS for hubs/marketing/accounts/propertygroups', () => {
    propertygroups.name = propertygroups.name.toLowerCase();
    updatePropertygroups.name = updatePropertygroups.name.toLowerCase();
    let id;
    return cloud.post(`${test.api}/propertygroups`, propertygroups)
      .then(r => {
        id = r.body.name;
        expect(r.body).to.not.be.empty;
      })
      .then(r => cloud.get(`${test.api}/propertygroups`))
      .then(r => cloud.patch(`${test.api}/propertygroups/${id}`, updatePropertygroups))
      .then(r => cloud.delete(`${test.api}/propertygroups/${id}`));
  });
  test.withApi(`${test.api}/propertygroups`)
    .withName('should allow pagination for accounts/propertygroups with page and nextPage')
    .should.supportNextPagePagination(2);
});
