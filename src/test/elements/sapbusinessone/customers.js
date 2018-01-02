'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);

suite.forElement('erp', 'customers', { payload: payload}, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('CardName');
  test.withOptions({ qs: { where: `lastModifiedDate >= '2010-10-26'`}}).should.supportPagination();
});
