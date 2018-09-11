'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const classificationsCreatePayload = tools.requirePayload(`${__dirname}/assets/classifications-create.json`);
const classificationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/classifications-update.json`);

const options = {
  churros: {
    updatePayload: classificationsUpdatePayload
  }
};

suite.forElement('erp', 'classifications', { payload : classificationsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});