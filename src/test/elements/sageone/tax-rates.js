'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/tax-rates');
const chakram = require('chakram');
const build = (overrides) => Object.assign({}, payload, overrides);
const taxRatesPayload = build({ reference: "re" + tools.randomInt() });

suite.forElement('finance', 'tax-rates', { payload: taxRatesPayload }, (test) => {
  test.should.supportCrus(chakram.put);
  test.should.supportPagination(1);
  it(`should support GET ${test.api}`, () => {
    return cloud.get(test.api);
  });
    it.skip('should support CRUDS for tax-rates', () => {
      let companyId;
      return cloud.post(test.api, payload)
        .then(r => id = r.body.id)
        .then(r => cloud.withOptions({ qs: { fields: 'percentage,agency' } })
          .get(`${test.api}/${id}`)
          .then(r => {
            expect(r.body).to.contain.key('percentage');
            expect(r.body).to.contain.key('agency');
          }));
        });
});
//where clause doesnot work
