'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let agentsCreatePayload = tools.requirePayload(`${__dirname}/assets/agents-create.json`);
let agentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/agents-update.json`);

const options = {
  churros: {
    updatePayload: agentsUpdatePayload
  }
};

suite.forElement('helpdesk', 'agents', { payload: agentsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
