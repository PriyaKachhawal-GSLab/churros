'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;
var objects = [
  "chargecardTransactions",
  "billsPayments",
  "checkingAccounts",
  "exchangeRateEntries",
  "exchangeRates",
  "exchangeRateTypes"
];

objects.forEach(obj => {
    suite.forElement('finan', `objects/${obj}/metadata`, (test) => {
        test.should.supportS();
        test.withApi(test.api)
            .withOptions({ qs: { customFieldsOnly: true } })
            .withName('should support return only custom fields')
            .should.return200OnGet();
    });
});
