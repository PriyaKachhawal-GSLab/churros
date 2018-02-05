'use strict';

const suite = require('core/suite');
const payload = tools.requirePayload(`${__dirname}/assets/currencies.json`);

suite.forElement('finance', 'currencies', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('code');
});
