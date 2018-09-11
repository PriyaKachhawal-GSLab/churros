'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const checksCreatePayload = tools.requirePayload(`${__dirname}/assets/checks-create.json`);
const checksUpdatePayload = tools.requirePayload(`${__dirname}/assets/checks-update.json`);

const options = {
  churros: {
    updatePayload: checksUpdatePayload
  }
};

suite.forElement('erp', 'checks', { payload : checksCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('memo');
});