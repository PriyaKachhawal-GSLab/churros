'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/projects.json`);

suite.forElement('helpdesk', 'projects', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where :`expand='lead'` }}).should.return200OnGet();
 });
