'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('analytics', 'folders', (test) => {
  let folderId, reportId, folder, folderName = 'Dont_Delete_LaunchBI_FOLDER';

  it('should allow GET /folders', () => {
    return cloud.withOptions({ qs: { id: '00O0H000006W76a'} }).get(test.api)
      .then(r => {
        folder = r.body.filter(obj => obj.Name && obj.Name === folderName);
        expect(folder).to.not.be.empty;
        folderId = folder[0].Id;
      });
  });

  it('should allow GET /folders/:id/reports', () => {
    return cloud.get(`/hubs/analytics/folders/${folderId}/reports`)
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.filter(obj => obj.Id !== "")).to.not.be.empty;
        reportId = r.body[0].Id;
      });
  });

  test.withApi(`/hubs/analytics/reports/${reportId}`)
    .withName(`should allow retrieve for specific report`)
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.empty;
    })
    .should.return200OnGet();


  test.withApi(`/hubs/analytics/info`)
    .withName(`should allow GET /info for system info`)
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.empty;
    })
    .should.return200OnGet();

});
