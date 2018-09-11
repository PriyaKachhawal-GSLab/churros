'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const journalEntriesCreatePayload = tools.requirePayload(`${__dirname}/assets/journal-entries-create.json`);
const journalEntriesUpdatePayload = tools.requirePayload(`${__dirname}/assets/journal-entries-update.json`);

const options = {
  churros: {
    updatePayload: journalEntriesUpdatePayload
  }
};

suite.forElement('erp', 'journal-entries', { payload : journalEntriesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});