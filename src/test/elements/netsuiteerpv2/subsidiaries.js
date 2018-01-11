'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/subsidiaries.json`);

suite.forElement('erp', 'subsidiaries', { payload: payload , skip : true }, (test) => {
  	test.should.supportCruds();
  	test.should.supportCeqlSearch('email');
});
