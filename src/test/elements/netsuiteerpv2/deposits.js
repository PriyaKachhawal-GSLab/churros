'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const depositsCreatePayload = tools.requirePayload(`${__dirname}/assets/deposits-create.json`);
const depositsUpdatePayload = tools.requirePayload(`${__dirname}/assets/deposits-update.json`);

const options = {
  churros: {
    updatePayload: depositsUpdatePayload
  }
};

suite.forElement('erp', 'deposits', { payload : depositsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});