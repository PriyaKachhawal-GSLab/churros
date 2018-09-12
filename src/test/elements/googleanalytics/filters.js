'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const payload = tools.requirePayload(`${__dirname}/assets/filters_payload.json`);

suite.forElement('general', 'filters', {payload: payload}, (test) => {
	test.should.supportCruds();
	test.should.supportPagination();
});