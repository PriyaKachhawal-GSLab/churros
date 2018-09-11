'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const vendorsCreatePayload = tools.requirePayload(`${__dirname}/assets/vendors-create.json`);
const vendorsUpdatePayload = tools.requirePayload(`${__dirname}/assets/vendors-update.json`);

const options = {
  churros: {
    updatePayload: vendorsUpdatePayload
  }
};

suite.forElement('erp', 'vendors', { payload : vendorsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});