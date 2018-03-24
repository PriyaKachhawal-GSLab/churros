'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

var objects = [
  "Account",
  "Task",
  "Invoice",
  "Opportunity",
  "ClientPortalUser",
  "Resource",
  "Product",
  "BillingItem",
  "Contact",
  "SalesOrder"
];

objects.forEach(obj => {
  suite.forElement('crm', `objects/${obj}/metadata`, (test) => {

    const validateAccountType = (fields) => {
      if (expect(fields.filter(field => (field.vendorPath === 'accountType' && field.vendorNativeType === 'picklist' && expect(field).to.contain.key('picklistValues')))).to.not.be.empty)
        return true;
      else
        return false;
    };

    test.should.supportS();
    test.withApi(test.api)
      .withValidation(r => {
        expect(r.body.fields.filter(field => (field.custom === false))).to.not.be.empty;
        if (obj === 'Account') {
          expect(validateAccountType(r.body.fields)).to.be.true;
        }
      })
      .withName('should support return all fields')
      .should.return200OnGet();

    test.withApi(test.api)
      .withOptions({ qs: { customFieldsOnly: true } })
      .withValidation(r => expect(r.body.fields.filter(field => (field.custom === true))))
      .withName('should support return only custom fields')
      .should.return200OnGet();
  });
});
