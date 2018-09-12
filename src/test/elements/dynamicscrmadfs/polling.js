'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const leadsPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const opportunitiesPayload = tools.requirePayload(`${__dirname}/assets/opportunities-create.json`);
const tasksPayload = tools.requirePayload(`${__dirname}/assets/tasks-create.json`);

suite.forElement('crm', 'polling', null, (test) => {
  test.withApi('/hubs/crm/accounts').should.supportPolling(accountsPayload, 'accounts');
  test.withApi('/hubs/crm/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/crm/leads').should.supportPolling(leadsPayload, 'leads');
  test.withApi('/hubs/crm/opportunities').should.supportPolling(opportunitiesPayload, 'opportunities');
  test.withApi('/hubs/crm/tasks').should.supportPolling(tasksPayload, 'tasks');
});
