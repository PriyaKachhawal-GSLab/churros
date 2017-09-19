'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const payload= require('./assets/tax-agencies');
const build = (overrides) => Object.assign({}, payload, overrides);
const agencyPayload = build({"displayName": tools.random()});

suite.forElement('finance', 'tax-agencies', { payload: agencyPayload, skip: true}, (test) => {
  test.should.supportCrs();
  test.withName(`should support searching ${test.api} by Id`)
    .withOptions({ qs: { where: `id ='1234'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

});
