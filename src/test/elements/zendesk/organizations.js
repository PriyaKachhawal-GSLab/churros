'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const organizationsCreatePayload = tools.requirePayload(`${__dirname}/assets/organizations-create.json`);
const organizationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/organizations-update.json`);

const options = {
  churros: {
    updatePayload: organizationsUpdatePayload
  }
};

suite.forElement('helpdesk', 'organizations', {payload : organizationsCreatePayload}, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
});
