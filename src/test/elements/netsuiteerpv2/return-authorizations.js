'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const returnAuthorizationsCreatePayload = tools.requirePayload(`${__dirname}/assets/return-authorizations-create.json`);
const returnAuthorizationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/return-authorizations-update.json`);

const options = {
  churros: {
    updatePayload: returnAuthorizationsUpdatePayload
  }
};

suite.forElement('erp', 'return-authorizations', { payload : returnAuthorizationsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});