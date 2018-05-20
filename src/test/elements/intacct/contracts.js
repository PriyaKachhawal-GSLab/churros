'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/contracts.json`);

suite.forElement('payment', 'contracts', { payload: payload}, (test) => {
  //for this resorces we need some specail permissions and account we are using in churros does not have that permissions hence APIs are failing for permission issue.
  test.should.supportCruds();
  test.should.supportNextPagePagination(2);
});
