'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;
var objects = [
    "candidates",
    "search",
    "companies",
    "notes",
    "clientContacts",
    "leads",
    "placements",
    "opportunities",
    "contacts"
];

objects.forEach(obj => {
    suite.forElement('crm', `objects/${obj}/metadata`, (test) => {
        test.should.supportS();
        test.withApi(test.api)
            .withOptions({ qs: { customFieldsOnly: true } })
            .withValidation(r => expect(r.body.fields.filter(field => (field.vendorPath.startsWith("custom") && field.custom === true))))
            .withName('should support return only custom fields')
            .should.return200OnGet();
    });
});