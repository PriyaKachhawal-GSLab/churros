'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let journalEntry = tools.requirePayload(`${__dirname}/assets/journal-entry.json`);

suite.forElement('finance', 'journal-entries', {payload: journalEntry}, (test) => {
  afterEach(done => {
    // to avoid rate limit errors
    setTimeout(done, 5000);
  });
  test.should.supportPagination();
  test.should.supportCruds();
});