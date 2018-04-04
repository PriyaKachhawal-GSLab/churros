'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
var objects = [
  "Quote",
  "Account",
  "Invoice",
  "TimeEntry",
  "TaxCategory",
  "Product",
  "PurchaseOrder",
  "Tax",
  "BillingItem",
  "ExpenseReport",
  "ProductVendor"
];

suite.forElement('finance', '/objects', (test) => {
    return Promise.all(objects.map(obj => {
        it(`should support GET /objects/${obj}/metadata`, () => {
             return cloud.get(`${test.api}/${obj}/metadata`)
             // we can guarantee that every object has fields ... which holds custom = false
            .then(r => expect(r.body.fields.filter(field => (field.custom === false))).to.not.be.empty);
        });

        it(`should support GET /objects/${obj}/metadata customFieldsOnly parameter`, () => {
             return cloud.withOptions({qs:{customFieldsOnly: true}}).get(`${test.api}/${obj}/metadata`)
             // we cannot guarantee that every object has custom fields ... so here i am checking reverese condition
             .then(r => expect(r.body.fields.filter(field => (field.custom === false))).to.be.empty);
        });
    }));
});
