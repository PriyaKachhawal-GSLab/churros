'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const accountsCreatePayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const accountsUpdatePayload = tools.requirePayload(`${__dirname}/assets/accounts-update.json`);

const options = {
  churros: {
    updatePayload: accountsUpdatePayload
  }
};

suite.forElement('erp', 'accounts', { payload : accountsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});