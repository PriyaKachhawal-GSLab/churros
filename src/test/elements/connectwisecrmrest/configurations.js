'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const oPayload = require('./assets/organizations');
const build = (overrides) => Object.assign({}, oPayload, overrides);
const orgPayload = build({ identifier: tools.randomStr('abcdefghijklmnopqrstuvwxyz0123456789', 10) });
const incidentpayload = require('./assets/incidents');
const configurationPayload = require('./assets/configurations');
const incidentConfigurationPayload = require('./assets/incidentconfigurations');

suite.forElement('crm', 'configurations', { payload: incidentpayload }, (test) => {
  test.should.supportPagination('id');
  it(`should support CDS for /configurations and SU for /incidents/{id}/configurations`, () => {
    let organizationId, incidentId, id;
    return cloud.post(`/hubs/crm/organizations`, orgPayload)
      .then(r => {
        organizationId = r.body.id;
        incidentpayload.company = { id: organizationId };
      })
      .then(r => cloud.post(`/hubs/crm/incidents`, incidentpayload))
      .then(r => {
        incidentId = r.body.id;
        configurationPayload.company = { id: organizationId };
      })
      .then(r => cloud.post(test.api, configurationPayload))
      .then(r => {
        id = r.body.id;
        incidentConfigurationPayload.id = id;
      })
      .then(r => cloud.withOptions({ qs: { where: "lastUpdated>='2018-04-26T00:00:00Z'" } }).get(test.api))
      .then(r => cloud.put(`hubs/crm/incidents/${incidentId}/configurations`, incidentConfigurationPayload))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`hubs/crm/incidents/${incidentId}/configurations`))
      .then(r => cloud.delete(`${test.api}/${id}`))
      .then(r => cloud.delete(`/hubs/crm/incidents/${incidentId}`))
      .then(r => cloud.delete(`/hubs/crm/organizations/${organizationId}`));
  });
});
