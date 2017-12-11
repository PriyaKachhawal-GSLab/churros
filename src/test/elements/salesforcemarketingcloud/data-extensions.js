'use strict';
const cloud = require('core/cloud');
const suite = require('core/suite');
const dataExtensionsRowsPayload = require('core/tools').requirePayload(`${__dirname}/assets/dataExtensionsRowCreate.json`);
const payload = require('./assets/dataExtension');

const putPayload = {
  "keys": dataExtensionsRowsPayload.keys,
  "values": {
    "name": "Big update",
    "whatever": 1
  }
};

const patchPayload = {
  "keys": dataExtensionsRowsPayload.keys,
  "values": {
    "whatever": 1
  }
};

suite.forElement('marketing', 'data-extensions', { payload: payload }, (test) => {
  test.withOptions({ churros: { updatePayload: { Name: 'updated churro' } } }).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');

  it('should allow CU for /data-extensions/:id/rows', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.post(`${test.api}/${id}/rows`, dataExtensionsRowsPayload))
      .then(r => cloud.put(`${test.api}/${id}/rows`, putPayload))
      .then(r => cloud.patch(`${test.api}/${id}/rows`, patchPayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
