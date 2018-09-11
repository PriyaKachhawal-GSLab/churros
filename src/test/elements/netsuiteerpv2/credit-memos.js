'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const creditMemosCreatePayload = tools.requirePayload(`${__dirname}/assets/credit-memos-create.json`);
const creditMemosUpdatePayload = tools.requirePayload(`${__dirname}/assets/credit-memos-update.json`);

const options = {
  churros: {
    updatePayload: creditMemosUpdatePayload
  }
};

suite.forElement('erp', 'credit-memos', { payload: creditMemosCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});