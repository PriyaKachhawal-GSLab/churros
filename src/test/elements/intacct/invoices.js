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

suite.forElement('finance', 'invoices', { payload: invoicesCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('description');
});
