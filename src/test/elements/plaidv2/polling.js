'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const incidentsTransactions = tools.requirePayload(`${__dirname}/assets/transactions.json`);

suite.forElement('plaidv2', 'polling', null, (test) => {
  test.withApi('/hubs/finance/transactions').should.supportPolling(incidentsTransactions, 'transactions');
});
