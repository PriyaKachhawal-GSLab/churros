'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/placments.json`);


suite.forElement('crm', 'placements', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});
