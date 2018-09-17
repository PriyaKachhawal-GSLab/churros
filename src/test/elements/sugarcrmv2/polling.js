'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const leadsPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const opportunitiesPayload = tools.requirePayload(`${__dirname}/assets/opportunities-create.json`);
const tasksPayload = tools.requirePayload(`${__dirname}/assets/tasks-create.json`);
const activitiesEmailsPayload = tools.requirePayload(`${__dirname}/assets/activities-emails-create.json`);
const activitiesCallsPayload = tools.requirePayload(`${__dirname}/assets/activities-calls-create.json`);
const activitiesEventsPayload = tools.requirePayload(`${__dirname}/assets/activities-events-create.json`);
const campaignsPayload = tools.requirePayload(`${__dirname}/assets/campaigns-create.json`);
const incidentsPayload = tools.requirePayload(`${__dirname}/assets/incidents-create.json`);

suite.forElement('finance', 'polling', null, (test) => {
  test.withApi('/hubs/finance/accounts').should.supportPolling(accountsPayload, 'accounts');
  test.withApi('/hubs/finance/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/finance/leads').should.supportPolling(leadsPayload, 'leads');
  test.withApi('/hubs/finance/opportunities').should.supportPolling(opportunitiesPayload, 'opportunities');
  test.withApi('/hubs/finance/tasks').should.supportPolling(tasksPayload, 'tasks');
  test.withApi('/hubs/finance/activities-emails').should.supportPolling(activitiesEmailsPayload, 'activities-emails');
  test.withApi('/hubs/finance/activities-calls').should.supportPolling(activitiesCallsPayload, 'activities-calls');
  test.withApi('/hubs/finance/activities-events').should.supportPolling(activitiesEventsPayload, 'activities-events');
  test.withApi('/hubs/finance/campaigns').should.supportPolling(campaignsPayload, 'campaigns');
  test.withApi('/hubs/finance/incidents').should.supportPolling(incidentsPayload, 'incidents');
});
