'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const journalsCreatePayload = tools.requirePayload(`${__dirname}/assets/journals-create.json`);
const transactionsCreatePayload = tools.requirePayload(`${__dirname}/assets/transactions-create.json`);


suite.forElement('finance', 'transactions', { payload: transactionsCreatePayload }, (test) => {
  let journalId;

  before(() => cloud.post(`hubs/finance/journals`, journalsCreatePayload)
    .then(r => {
      journalId = r.body.id;
      transactionsCreatePayload.journalid = journalId;
    }));

  after(() => cloud.delete(`hubs/finance/journals/${journalId}`));

  test.should.supportPagination('id');
  test.should.supportCrds();
  test.should.supportCeqlSearchForMultipleRecords('description');
});