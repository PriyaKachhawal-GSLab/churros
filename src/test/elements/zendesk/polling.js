'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const usersCreatePayload = tools.requirePayload(`${__dirname}/assets/users-create.json`);

suite.forElement('helpdesk', 'polling', null, (test) => {
  test.withApi('/hubs/helpdesk/users').should.supportPolling(usersCreatePayload, 'users');
});
