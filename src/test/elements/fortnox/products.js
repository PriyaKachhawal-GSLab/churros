'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/products.json`);

suite.forElement('finance', 'products', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
});