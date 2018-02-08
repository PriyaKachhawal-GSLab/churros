'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const payload = tools.requirePayload(`${__dirname}/assets/project.json`);

suite.forElement('finance', 'projects', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});
