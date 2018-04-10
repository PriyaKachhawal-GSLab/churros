'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
var objects = [
  "afrinCustom_c",
  "folders",
  "externalActivityTypeAttributes",
  "activityTypes",
  "externalActivityType",
  "externalActivityTypeApprove",
  "campaigns",
  "leadActivities_c",
  "contactsMerge",
  "company",
  "externalActivityTypes",
  "sampleBulkCustomObject_c",
  "tagTypes",
  "partitions",
  "listsLeadsIsMember",
  "filesContent",
  "attendance_c",
  "opportunity",
  "linktest_c",
  "channels",
  "leads",
  "lists",
  "activities",
  "aw_c",
  "files",
  "programsLeads",
  "programs",
  "readyTalkMeetingInfo_c"
];

suite.forElement('marketing', 'objects', (test) => {
    return Promise.all(objects.map(obj => {
        it(`should support GET /objects/${obj}/metadata`, () => {
             return cloud.get(`${test.api}/${obj}/metadata`)
            .then(r => {
              expect(r.body.fields).to.not.be.empty;
              expect(r.body.fields.filter(field => field.vendorPath)).to.not.be.empty;
            });
        });
    }));
});
