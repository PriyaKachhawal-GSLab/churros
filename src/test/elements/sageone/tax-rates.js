'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/tax-rates');
const chakram = require('chakram');
const build = (overrides) => Object.assign({}, payload, overrides);
const taxRatesPayload = build({ reference: "re" + tools.randomInt() });

suite.forElement('finance', 'tax-rates', { payload: taxRatesPayload }, (test) => {
  let name;
  test.should.supportCrus(chakram.put);
  test.should.supportPagination(1);
  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api);
  });
});
//where clause doesnot work
