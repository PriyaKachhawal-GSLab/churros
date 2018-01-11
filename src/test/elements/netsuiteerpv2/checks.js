'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/checks.json`);

suite.forElement('erp', 'checks', { payload: payload }, (test) => {
  	test.should.supportCruds();
  	test.should.supportCeqlSearch('memo');
});
