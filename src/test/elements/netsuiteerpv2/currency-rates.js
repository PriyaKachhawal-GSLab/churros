'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const currencyRatesCreatePayload = tools.requirePayload(`${__dirname}/assets/currency-rates-create.json`);

suite.forElement('erp', 'currency-rates', { payload : currencyRatesCreatePayload }, (test) => {
  test.should.supportCrds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});