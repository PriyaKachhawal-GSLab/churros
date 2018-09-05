'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const contactsPayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const customObjectsPayload =  tools.requirePayload(`${__dirname}/assets/customObjects-create.json`);


suite.forElement('marketing', 'polling', null, (test) => {
  test.withApi('/hubs/marketing/contacts').should.supportPolling(contactsPayload, 'contacts');
  test.withApi('/hubs/marketing/custom-objects').should.supportPolling(customObjectsPayload, 'custom-objects');
});
