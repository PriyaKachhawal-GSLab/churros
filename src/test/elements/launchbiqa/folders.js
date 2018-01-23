'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('general', 'folders', (test) => {

  let folderId, reportId;

  test.withApi(`/hubs/general/rootFolder`)
    .withName(`List all Root Folders /rootFolder`)
    .withValidation(r => {
      folderId = r.body[0].id;
      expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
    })
    .should.return200OnGet();



  it('should allow GET /folders/:id/contents', () => {
    return cloud.get(`${test.api}/${folderId}/contents`)
      .then(r => {
        folderId = r.body[0].id;
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
      });
  });



  it('should allow GET /folders/:id/reports', () => {
    return cloud.get(`${test.api}/${folderId}/reports`)
      .then(r => {
        reportId = r.body[0].id;
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
      });
  });

  test.withApi(`/hubs/general/reports/${reportId}`)
    .withName(`Retrieve specific Report`)
    .withValidation(r => expect(r.body.id !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/general/ping`)
    .withName(`Check system health`)
    .withValidation(r => expect(r.body['launchbi-status'] !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/general/system-info`)
    .withName(`Retrieve system-info`)
    .withValidation(r => expect(r.body.server !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/general/native`)
    .withName(`List all native`)
    .withOptions({ qs: { 'resourceName': 'schedules' } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .should.return200OnGet();

});
