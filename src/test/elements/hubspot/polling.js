'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const accountsPayload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const dealsPayload = tools.requirePayload(`${__dirname}/assets/deals.json`);

suite.forElement('marketing', 'polling', null, (test) => {
  test.withApi('/hubs/marketing/accounts').should.supportPolling(accountsPayload, 'accounts');
  test.withApi('/hubs/marketing/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/marketing/deals').should.supportPolling(dealsPayload, 'deals');
});
