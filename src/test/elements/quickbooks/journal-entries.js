'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const CreatePayload = tools.requirePayload(`${__dirname}/assets/journal-entries-create.json`);
const UpdatePayload = tools.requirePayload(`${__dirname}/assets/journal-entries-update.json`);

const options = {
  churros: {
    updatePayload: UpdatePayload
  }
};

suite.forElement('finance', 'journal-entries', { payload: CreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('txnDate');
});