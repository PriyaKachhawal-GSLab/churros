'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const journalsCreatePayload = tools.requirePayload(`${__dirname}/assets/journals-create.json`);
const journalsUpdatePayload = tools.requirePayload(`${__dirname}/assets/journals-update.json`);

const options = {
  churros: {
    updatePayload: journalsUpdatePayload
  }
};

suite.forElement('finance', 'journals', { payload: journalsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('title');
});
