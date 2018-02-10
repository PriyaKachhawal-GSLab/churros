'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('analytics', 'folders', (test) => {

  let folderId, reportId;

  it('should allow GET /folders', () => {
    return cloud.get(test.api)
      .then(r => {
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
        folderId = r.body[0].id;
      })
      .then(() => cloud.withOptions({ qs: { id: folderId } }).get(test.api))
      .then(r => folderId = r.body[0].id);
  });

  it('should allow GET /folders/:id/reports', () => {
    return cloud.get(`/hubs/analytics/folders/${folderId}/reports`)
      .then(r => {
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
        reportId = r.body[0].id;
      });
  });

  test.withApi(`/hubs/analytics/reports/${reportId}`)
    .withName(`Retrieve specific Report`)
    .withValidation(r => expect(r.body).to.not.be.empty)
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/ping`)
    .withName(`Check system health`)
    .withValidation(r => expect(r.body).to.not.be.empty)
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/info`)
    .withName(`Retrieve system-info`)
    .withValidation(r => expect(r.body).to.not.be.empty)
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/native`)
    .withName(`List all native`)
    .withOptions({ qs: { 'resourceName': 'schedules' } })
    .withValidation(r => expect(r.body[0]).to.not.be.empty)
    .should.return200OnGet();

});
