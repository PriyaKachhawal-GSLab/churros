'use strict';
const suite = require('core/suite');
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

objects.forEach(obj => {
    suite.forElement('finance', `objects/${obj}/metadata`, (test) => {
        test.should.supportS();
        test.withApi(test.api)
            .withOptions({ qs: { customFieldsOnly: true } })
            .withValidation(r => expect(r.body.fields.filter(field => (field.custom === true))))
            .withName('should support return only custom fields')
            .should.return200OnGet();
    });
});
