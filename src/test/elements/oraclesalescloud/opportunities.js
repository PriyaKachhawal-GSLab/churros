'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/opportunities.json`);
const tools = require('core/tools');

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.should.supportCeqlSearchForMultipleRecords('Name');
  test.should.supportCruds();
});
