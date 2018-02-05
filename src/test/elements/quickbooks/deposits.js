'use strict';

const suite = require('core/suite');
const payload = tools.requirePayload(`${__dirname}/assets/deposits.json`);

suite.forElement('finance', 'deposits', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('txnDate');
});
