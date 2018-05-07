'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/tax-rates');
const chakram = require('chakram');
const expect = chakram.expect;
const build = (overrides) => Object.assign({}, payload, overrides);
const taxRatesPayload = build({
  reference: "re" + tools.randomInt()
});

suite.forElement('finance', 'tax-rates', {
  payload: taxRatesPayload
}, (test) => {
  test.should.supportCrus(chakram.put);
  test.should.supportPagination(1);
  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api);
  });

  test
    .withOptions({
      qs: {
        attributes: 'percentage'
      }
    })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      expect(r.body[0]).to.contain.key('percentage');
    }).should.return200OnGet();
});
//where clause doesnot work
