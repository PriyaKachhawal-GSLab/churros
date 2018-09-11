'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const invoicesCreatePayload = tools.requirePayload(`${__dirname}/assets/invoices-create.json`);
const invoicesUpdatePayload = tools.requirePayload(`${__dirname}/assets/invoices-update.json`);

const options = {
  churros: {
    updatePayload: invoicesUpdatePayload
  }
};

suite.forElement('erp', 'invoices', { payload : invoicesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});