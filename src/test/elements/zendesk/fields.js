'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const fieldsCreatePayload = tools.requirePayload(`${__dirname}/assets/fields-create.json`);
const fieldsUpdatePayload = tools.requirePayload(`${__dirname}/assets/fields-update.json`);

const options = {
  churros: {
    updatePayload: fieldsUpdatePayload
  }
};

suite.forElement('helpdesk', 'fields', { payload  : fieldsCreatePayload}, (test) => {
  test.withApi(`${test.api}/incident-field`).withOptions(options).should.supportCruds();
  test.withApi(`${test.api}/user-field`).withOptions(options).should.supportCruds();
});
