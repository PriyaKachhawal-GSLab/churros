'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/product.json`);
payload.Code = tools.randomStr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 1);

suite.forElement('erp', 'products', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.should.supportCruds();
});