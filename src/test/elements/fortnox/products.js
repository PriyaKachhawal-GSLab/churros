'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/product.json`);

suite.forElement('finance', 'products', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});