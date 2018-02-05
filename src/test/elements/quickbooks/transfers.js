'use strict';

const suite = require('core/suite');
const payload = tools.requirePayload(`${__dirname}/assets/transfers.json`);

suite.forElement('finance', 'transfers', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('txnDate');
});
