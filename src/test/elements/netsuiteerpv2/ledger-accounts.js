'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const ledgerAccountsCreatePayload = tools.requirePayload(`${__dirname}/assets/ledger-accounts-create.json`);
const ledgerAccountsUpdatePayload = tools.requirePayload(`${__dirname}/assets/ledger-accounts-update.json`);

const options = {
  churros: {
    updatePayload: ledgerAccountsUpdatePayload
  }
};

suite.forElement('erp', 'ledger-accounts', { payload : ledgerAccountsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});