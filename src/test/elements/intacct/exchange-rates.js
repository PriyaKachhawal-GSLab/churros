'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/exchange-rates-create.json`);

suite.forElement('payment', 'exchange-rates', { payload: payload , skip:true}, (test) => {
  test.should.supportCrs();
  test.should.supportNextPagePagination(2);
});
