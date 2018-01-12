'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/classifications.json`);
const payloadPost = require('core/tools').requirePayload(`${__dirname}/assets/classifications.json`);

payload.name = tools.random();
payloadPost.name = tools.random();

suite.forElement('erp', 'classifications', { payload: payload }, (test) => {
  	test.should.supportCruds();
	test.withOptions({ qs: { page: 1, pageSize: 5}}).should.supportPagination();
  	test.should.supportCeqlSearch('name',payloadPost);
});
