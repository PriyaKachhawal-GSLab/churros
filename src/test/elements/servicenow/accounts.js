'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let accountsCreatePayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
let accountsUpdatePayload = tools.requirePayload(`${__dirname}/assets/accounts-update.json`);

const options = {
  churros: {
    updatePayload: accountsUpdatePayload
  }
};

suite.forElement('helpdesk', 'accounts', { payload: accountsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
