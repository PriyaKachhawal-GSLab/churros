'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/contacts-update.json`);
const fieldsUpdate = tools.requirePayload(`${__dirname}/assets/contactsProperties-update.json`);
const propertiesPayload = tools.requirePayload(`${__dirname}/assets/contactsProperties-create.json`);
const propertygroups = tools.requirePayload(`${__dirname}/assets/contactsPropertygroups-create.json`);
const updatePropertygroups = tools.requirePayload(`${__dirname}/assets/contactsPropertygroups-update.json`);
fieldsUpdate.name = fieldsUpdate.name.toLowerCase();
propertygroups.name = propertygroups.name.toLowerCase();

const options = {
  churros: {
    updatePayload: updatePayload
  }
};

suite.forElement('marketing', 'contacts', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.should.supportNextPagePagination(1);

  test.withName('should allow pagination for all contacts with page and nextPage').withOptions({ qs: { all: true } }).should.supportNextPagePagination(2);
  it('should allow CRUD for hubs/marketing/contacts/properties', () => {
    let id;
    return cloud.post(`${test.api}/properties`, propertiesPayload)
      .then(r => id = r.body.name)
      .then(r => cloud.get(`${test.api}/properties`))
      .then(r => cloud.get(`${test.api}/properties/${id}`))
      .then(r => cloud.patch(`${test.api}/properties/${id}`, fieldsUpdate))
      .then(r => cloud.delete(`${test.api}/properties/${id}`));
  });
  it('should allow CRUD for hubs/marketing/contacts/propertygroups', () => {
    let id;
    return cloud.post(`${test.api}/propertygroups`, propertygroups)
      .then(r => id = r.body.name)
      .then(r => cloud.get(`${test.api}/propertygroups`))
      .then(r => cloud.get(`${test.api}/propertygroups/${id}`))
      .then(r => cloud.patch(`${test.api}/propertygroups/${id}`, updatePropertygroups))
      .then(r => cloud.delete(`${test.api}/propertygroups/${id}`));
  });
  const metaData = { useBatchUpload: true };
  const opts = { formData: { metaData: JSON.stringify(metaData) } };
  test.should.supportBulkUpload(opts, `${__dirname}/assets/contacts.csv`, 'contacts', `email='test123@churros.com'`);

});
