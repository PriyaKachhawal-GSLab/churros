'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const vendorCreditsCreatePayload = tools.requirePayload(`${__dirname}/assets/vendor-credits-create.json`);
const vendorCreditsUpdatePayload = tools.requirePayload(`${__dirname}/assets/vendor-credits-update.json`);

const options = {
  churros: {
    updatePayload: vendorCreditsUpdatePayload
  }
};

suite.forElement('erp', 'vendor-credits', { payload : vendorCreditsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});