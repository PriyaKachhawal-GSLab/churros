'use strict';
const cloud = require('core/cloud');
const suite = require('core/suite');
const dataExtensionsPayload = require('core/tools').requirePayload(`${__dirname}/assets/dataExtensions.json`);

const putPayload = {
  "keys": dataExtensionsPayload.keys,
  "values": {
    "firstName": "John",
    "lastLogin": "2013-05-23T14:32:00Z",
    "lastName": "Update",
    "isActive": "True",
    "birthDate": "10/21/2000",
    "whatever": 1
  }
};

const patchPayload = {
  "keys": dataExtensionsPayload.keys,
  "values": {
    "whatever": 1
  }
};

suite.forElement('marketing', 'data-extensions', (test) => {
  it('should allow CU for /data-extensions', () => {
    let id = '10F95B23-E336-4B82-966F-C42B5AC44123'; // can't create this via the API
    return cloud.post(`${test.api}/${id}/rows`, dataExtensionsPayload)
      .then(r => cloud.put(`${test.api}/${id}/rows`, putPayload))
      .then(r => cloud.patch(`${test.api}/${id}/rows`, patchPayload));
  });
});
