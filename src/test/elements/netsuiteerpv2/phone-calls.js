'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const phoneCallsCreatePayload = tools.requirePayload(`${__dirname}/assets/phone-calls-create.json`);
const phoneCallsUpdatePayload = tools.requirePayload(`${__dirname}/assets/phone-calls-update.json`);

const options = {
  churros: {
    updatePayload: phoneCallsUpdatePayload
  }
};

suite.forElement('erp', 'phone-calls', { payload : phoneCallsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});