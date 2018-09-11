'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const incidentsPayload = tools.requirePayload(`${__dirname}/assets/incidents-create.json`);

// Issue with sap so am skippinf for now
suite.forElement('helpdesk', 'polling', { skip:true }, (test) => {
  test.withApi('/hubs/helpdesk/accounts').should.supportPolling(accountsPayload, 'accounts');
  test.withApi('/hubs/helpdesk/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/helpdesk/incidents').should.supportPolling(incidentsPayload, 'incidents');
});
