'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('general', 'folders', (test) => {

  let folderId, reportId;

  test.withApi(test.api)
    .withName(`List all Root Folders /folders`)
    .withValidation(r => {
      folderId = r.body[0].id;
      expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
    })
    .should.return200OnGet();

  test.withApi(test.api)
    .withName(`List all Sub Folders /folders/:id`)
    .withOptions({ qs: { where: "id = `${folderId}`" } })
    .withValidation(r => {
      expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
    })
    .should.return200OnGet();

  test.withApi(`/hubs/general/folders/reports`)
    .withName(`List all reports from Root Folders /reports`)
    .withValidation(r => {
        reportId = r.body[0].id;
        expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty;
    })
    .should.return200OnGet();

  test.withApi(`/hubs/general/folders/reports`)
    .withName(`List all reports from specific Folders /folders/:id`)
    .withOptions({ qs: { where: "id = `${folderId}`" } })
    .withValidation(r => {
      expect(r.body.filter(obj => obj.link !== "")).to.not.be.empty;
    })
    .should.return200OnGet();

  test.withApi(`/hubs/general/ping-lbi`)
    .withName(`Retrieve launchbi-status`)
    .withValidation(r => expect(r.body['launchbi-status'] !== ""))
    .should.return200OnGet();


  test.withApi(`/hubs/general/system-info`)
    .withName(`Retrieve system-info`)
    .withValidation(r => expect(r.body['server'] !== ""))
    .should.return200OnGet();

    test.withApi(`/hubs/general/reports/${reportId}`)
      .withName(`Retrieve specific Report`)
      .withValidation(r => expect(r.body.id !== ""))
      .should.return200OnGet();


  test.withApi(`/hubs/general/native`)
    .withName(`List all native`)
    .withOptions({ qs: { 'resourceName': 'schedules' } })
    .withValidation(r => expect(r.body.filter(obj => obj.id !== "")).to.not.be.empty)
    .should.return200OnGet();

});
