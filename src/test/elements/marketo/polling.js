'use strict';

const suite = require('core/suite');

const contactsPayload = require('./assets/contacts-create');
suite.forElement('marketing', 'polling', null, (test) => {
  test.withApi('/hubs/marketing/contacts').should.supportPolling(contactsPayload, 'leads');
});
