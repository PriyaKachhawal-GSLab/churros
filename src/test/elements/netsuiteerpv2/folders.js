'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const foldersCreatePayload = tools.requirePayload(`${__dirname}/assets/folders-create.json`);
const foldersUpdatePayload = tools.requirePayload(`${__dirname}/assets/folders-update.json`);

const options = {
  churros: {
    updatePayload: foldersUpdatePayload
  }
};

suite.forElement('erp', 'folders', { payload : foldersCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});