'use strict';

const tools = require('core/tools');
const suite = require('core/suite');

const agentsCreatePayload = tools.requirePayload(`${__dirname}/assets/agents-create.json`);
const agentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/agents-update.json`);

const options = {
  churros: {
    updatePayload: agentsUpdatePayload
  }
};

suite.forElement('helpdesk', 'agents', { payload: agentsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearch('id');
});
