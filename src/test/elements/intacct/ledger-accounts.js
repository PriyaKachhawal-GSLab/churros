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

suite.forElement('finance', 'ledger-accounts', { payload: ledgerAccountsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('title');
});
