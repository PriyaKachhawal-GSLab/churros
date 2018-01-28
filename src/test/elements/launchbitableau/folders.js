'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('analytics', 'folders', (test) => {

  let folderId, reportId;



  it('should allow GET /folders', () => {
    return cloud.get(test.api)
      .then(r => {
        folderId = r.body[0].id;
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
      });
  });

  it('should allow GET /folders/:id/workbooks', () => {
    return cloud.get(`${test.api}/${folderId}/workbooks`)
      .then(r => {
        folderId = r.body[0].id;
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
      });
  });



  it('should allow GET /workbooks/:id/reports', () => {
    return cloud.get(`/hubs/analytics/workbooks/${folderId}/reports`)
      .then(r => {
        reportId = r.body[0].id;
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
      });
  });

  test.withApi(`/hubs/analytics/reports/${reportId}`)
    .withName(`Retrieve specific Report`)
    .withValidation(r => expect(r.body.id !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/ping`)
    .withName(`Check system health`)
    .withValidation(r => expect(r.body['launchbi-status'] !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/info`)
    .withName(`Retrieve system-info`)
    .withValidation(r => expect(r.body.server !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/native`)
    .withName(`List all native`)
    .withOptions({ qs: { 'resourceName': 'schedules' } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .should.return200OnGet();

});
