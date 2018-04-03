'use strict';
const suite = require('core/suite');
const expect = require('chakram').expect;
var objects = [
  "accountsNotes",
  "leadsNotes",
  "campaigns",
  "incidents",
  "campaignsNotes",
  "incidentsNotesAttachments",
  "tasks",
  "incidentsHistory",
  "incidentsNotes",
  "accountsActivities",
  "contactsActivities",
  "opportunities",
  "users",
  "activities",
  "leads",
  "activitiesRaw",
  "accounts",
  "opportunitiesNotes",
  "contacts",
  "contactsNotes"
];

objects.forEach(obj => {
  suite.forElement('finance', `objects/${obj}/metadata`, (test) => {
    return Promise.all(objects.map(obj => {
      test.should.supportS();
      test.withApi(test.api)
        .withOptions({ qs: { customFieldsOnly: true } })
        .withValidation(r => expect(r.body.fields.filter(field => (field.vendorPath.endsWith("_c") && field.custom === true))))
        .withName(`should support return only custom fields for ${obj}`)
        .should.return200OnGet();
    }));
  });
});
