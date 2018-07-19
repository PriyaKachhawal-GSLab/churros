'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/inventories.json`);

suite.forElement('ecommerce', 'inventories', { payload: payload }, (test) => {
  test.withOptions({ qs: { where: `QueryStartDateTime = '2018-04-02T05:00:00Z'` } }).should.supportCrus();
});