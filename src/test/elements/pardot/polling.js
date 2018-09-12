'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const leadsPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);

suite.forElement('marketing', 'polling', null, (test) => {
  test.withApi('/hubs/marketing/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/marketing/leads').should.supportPolling(leadsPayload, 'leads');
});
