'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const oPayload = require('./assets/organizations');
const incidentpayload = require('./assets/incidents');
const configurationPayload = require('./assets/configurations');
const incidentConfigurationPayload = require('./assets/incidentconfigurations');

const createOrganization = (oPayload) => {
  oPayload.identifier = tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 20);
  return oPayload;
};

suite.forElement('crm', 'configurations', { payload: incidentpayload }, (test) => {
  test.should.supportPagination('id');
  let incidentId, organizationId;
  before(() => {
    return cloud.post(`/hubs/crm/organizations`, createOrganization(oPayload))
      .then(r => {
        organizationId = r.body.id;
        incidentpayload.company = { id: organizationId };
      })
      .then(r => cloud.post(`/hubs/crm/incidents`, incidentpayload))
      .then(r => {
        incidentId = r.body.id;
        configurationPayload.company = { id: organizationId };
        configurationPayload.name = tools.random();
      });
  });

  it(`should support CDS for /configurations and SU for /incidents/{id}/configurations`, () => {
    let id;
    return cloud.post(test.api, configurationPayload)
      .then(r => {
        id = r.body.id;
        incidentConfigurationPayload.id = id;
      })
      .then(r => cloud.withOptions({ qs: { where: "lastUpdated>='2018-04-26T00:00:00Z'" } }).get(test.api))
      .then(r => expect(r).to.have.statusCode(200))
      .then(r => cloud.put(`hubs/crm/incidents/${incidentId}/configurations`, incidentConfigurationPayload))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`hubs/crm/incidents/${incidentId}/configurations`))
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.have.lengthOf(1);
      })
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  after(() => {
    return cloud.delete(`/hubs/crm/incidents/${incidentId}`)
      .then(r => cloud.delete(`/hubs/crm/organizations/${organizationId}`));
  });
});
