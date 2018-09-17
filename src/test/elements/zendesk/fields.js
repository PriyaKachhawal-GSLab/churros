'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const incidentFieldCreatePayload = tools.requirePayload(`${__dirname}/assets/fieldsIncidentField-create.json`);
const fieldsUpdatePayload = tools.requirePayload(`${__dirname}/assets/fieldsIncidentField-update.json`);

const options = {
  churros: {
    updatePayload: fieldsUpdatePayload
  }
};

suite.forElement('helpdesk', 'fields', { payload  : incidentFieldCreatePayload}, (test) => {
  test.withApi(`${test.api}/incident-field`).withOptions(options).should.supportCruds();
  test.withApi(`${test.api}/user-field`).withOptions(options).should.supportCruds();
});
