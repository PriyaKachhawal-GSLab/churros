'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/brands.json`);

suite.forElement('helpdesk', 'brands', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});
