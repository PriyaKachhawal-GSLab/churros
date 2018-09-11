'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/workflows-create.json`);

suite.forElement('marketing', 'workflows', { payload: payload }, (test) => {

  test.should.supportCrds();
  test.should.supportNextPagePagination(2);
});
