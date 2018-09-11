'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const incidentsCreatePayload = tools.requirePayload(`${__dirname}/assets/incidents-create.json`);
const incidentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/incidents-update.json`);
const incidentsCommentsCreatePayload = tools.requirePayload(`${__dirname}/assets/incidentsComments-create.json`);
const incidentsCommentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/incidentsComments-update.json`);
const incidentsAttachmentsQueryParamPayload = tools.requirePayload(`${__dirname}/assets/incidentsAttachments-requiredQueryParam-c.json`);

const incidentsOptions = {
  churros: {
    updatePayload: incidentsUpdatePayload
  }
};

// Calling the incidents endpoint (ServiceRequestCollection) directly to test {objectName} APIs
suite.forElement('crm', 'ServiceRequestCollection', { payload: incidentsCreatePayload }, (test) => {
  let incidentId;

  before(() => cloud.post(test.api, incidentsCreatePayload)
    .then(r => incidentId = r.body.id));

  after(() => cloud.delete(`${test.api}/${incidentId}`));

  test.withOptions(incidentsOptions).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');

  it(`should allow CRUDS for /hubs/helpdesk/ServiceRequestCollection/{id}/ServiceRequestDescription`, () => {
    let commentId;
    return cloud.post(`${test.api}/${incidentId}/ServiceRequestDescription`, incidentsCommentsCreatePayload)
    .then(r => commentId = r.body.id)
    .then(r => cloud.get(`${test.api}/${incidentId}/ServiceRequestDescription/${commentId}`))
    .then(r => cloud.patch(`/ServiceRequestDescriptionCollection/${commentId}`, incidentsCommentsUpdatePayload))
    .then(r => cloud.get(`${test.api}/${incidentId}/ServiceRequestDescription`))
    .then(r => cloud.withOptions({ qs: { pageSize: 1 }}).get(`${test.api}/${incidentId}/ServiceRequestDescription`))
    .then(r => expect(r.body.length).to.equal(1))
    .then(r => cloud.delete(`/ServiceRequestDescriptionCollection/${commentId}`));
  });

  it(`should allow CRDS for ${test.api}/:id/ServiceRequestAttachmentFolder`, () => {
    let attachmentId;
    let metadataOptions = {
      formData: {
        metadata: JSON.stringify(incidentsAttachmentsQueryParamPayload)
      }
    };
    return cloud.withOptions(metadataOptions).postFile(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder/attachments`, __dirname + '/assets/incidentsAttachments-create.jpg')
      .then(r => attachmentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder/${attachmentId}`))
      .then(r => cloud.get(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`/ServiceRequestAttachmentFolderCollection/${attachmentId}`));
  });
});
