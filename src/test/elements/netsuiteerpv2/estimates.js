'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const estimatesCreatePayload = tools.requirePayload(`${__dirname}/assets/estimates-create.json`);
const estimatesUpdatePayload = tools.requirePayload(`${__dirname}/assets/estimates-update.json`);

const options = {
  churros: {
    updatePayload: estimatesUpdatePayload
  }
};

suite.forElement('erp', 'estimates', { payload : estimatesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});