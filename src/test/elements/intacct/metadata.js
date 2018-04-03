'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
var objects = [
  "chargecardTransactions",
  "billsPayments",
  "checkingAccounts",
  "exchangeRateEntries",
  "exchangeRates",
  "exchangeRateTypes"
];

suite.forElement('finance', '/objects', (test) => {
  return Promise.all(objects.map(obj => {
    it(`should support GET /objects/${obj}/metadata`, () => {
      return cloud.get(`${test.api}/${obj}/metadata`);
    });

    it(`should support GET /objects/${obj}/metadata customFieldsOnly parameter`, () => {
      return cloud.withOptions({ qs: { customFieldsOnly: true } }).get(`${test.api}/${obj}/metadata`).
      then(r => expect(r.body.fields.filter(field => (field.vendorPath.startsWith("custom") &&
        field.custom === true))));
    });
  }))
});