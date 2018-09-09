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

suite.forElement('finance', 'vendors', { payload: vendorsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
