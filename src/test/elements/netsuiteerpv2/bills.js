'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const billsCreatePayload = tools.requirePayload(`${__dirname}/assets/bills-create.json`);
const billsUpdatePayload = tools.requirePayload(`${__dirname}/assets/bills-update.json`);

const options = {
  churros: {
    updatePayload: billsUpdatePayload
  }
};

suite.forElement('erp', 'bills', { payload : billsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});