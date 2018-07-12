'use strict';

const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');
let payload = require('./assets/issuetype');
payload.name = payload.name + tools.random();
const uri = '/hubs/helpdesk/incident-types';
const updatePayload = {};
updatePayload.name = payload.name;

suite.forElement('helpdesk', 'incidentTypes', {payload:payload}, (test) => {
  it('should allow CRUDS for /incidents-types', () => {
  let incidentTypeId;
  return cloud.post(uri, payload)
  .then(r => incidentTypeId = r.body.id)
  .then(r => cloud.withOptions({qs:{ where: `id='${incidentTypeId}'` }}).get('/hubs/helpdesk/incident-types'))
  .then(r => cloud.get(uri + "/" + incidentTypeId))
  .then(r => cloud.get(uri))
  .then(r => cloud.update(uri + '/' + incidentTypeId, updatePayload))
  .then(r => cloud.delete(uri + '/' + incidentTypeId));
});
});
