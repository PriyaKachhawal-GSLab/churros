'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const propertiesPayload = tools.requirePayload(`${__dirname}/assets/contactsProperties.json`);
propertiesPayload.name = propertiesPayload.name.toLowerCase();

const options = {
  churros: {
    updatePayload: {
      "firstName": tools.random(),
      "lastName": tools.random()
    }
  }
};

suite.forElement('marketing', 'contacts', { payload: payload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.should.supportNextPagePagination(1);

  test.withName('should allow pagination for all contacts with page and nextPage').withOptions({qs: { all: true }}).should.supportNextPagePagination(2);
  it('should allow CRUD for hubs/marketing/contacts/properties', () => {
    let id;
    const fieldsUpdate = {
      "favoritedOrder": -1,
      "hidden": false,
      "mutableDefinitionNotDeletable": false,
      "displayOrder": -1,
      "description": "The country reported by a contact's IP address. This is automatically set by HubSpot and can be used for segmentation and reporting.",
      "label": "IP Country",
      "type": "string",
      "readOnlyDefinition": false,
      "formField": false,
      "displayMode": "current_value",
      "groupName": "conversioninformation",
      "name": "a"+tools.random().toLowerCase(),
      "options": [],
      "fieldType": "text",
      "calculated": false,
      "externalOptions": false,
      "favorited": false
    };
    return cloud.post(`${test.api}/properties`, propertiesPayload)
      .then(r => id = r.body.name)
      .then(r => cloud.get(`${test.api}/properties`))
      .then(r => cloud.get(`${test.api}/properties/${id}`))
      .then(r => cloud.patch(`${test.api}/properties/${id}`, fieldsUpdate))
      .then(r => cloud.delete(`${test.api}/properties/${id}`));
  });
  it('should allow CRUD for hubs/marketing/contacts/propertygroups', () => {
    let id;
    const propertygroups = {
      "displayName": "test_churros_1",
      "displayOrder": 0,
      "name": tools.random()
    };
    const updatePropertygroups = {
      "displayName": "test_churros1",
      "displayOrder": 0,
      "name": tools.random()
    };
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
