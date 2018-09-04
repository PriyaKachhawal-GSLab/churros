'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const contactsPayload = require('./assets/contacts-create');
suite.forElement('marketing', 'polling', null, (test) => {
  test.withApi('/hubs/marketing/contacts').should.supportPolling(contactsPayload, 'leads');
});
