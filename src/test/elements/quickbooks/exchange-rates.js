'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/exchange-rates.json`);

suite.forElement('finance', 'exchange-rates', { payload: payload }, (test) => {
  it(`Should support RU on ${test.api}`, () => {
    cloud.get(`${test.api}/USD`)
      .then(r => expect(r).to.statusCode(200));
    //PUT only works with account having multicurrency enabled. Hence need to skip
    cloud.withOptions({ skip: true }).put(`${test.api}/USD`, payload);
  });
});
