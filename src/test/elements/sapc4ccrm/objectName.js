'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;


const commentsCreatePayload = tools.requirePayload(`${__dirname}/assets/ServiceRequestCollectionServiceRequestDescription-create.json`);
const commentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/ServiceRequestCollectionServiceRequestDescription-update.json`);
const incidentsCreatePayload = tools.requirePayload(`${__dirname}/assets/ServiceRequestCollection-create.json`);
const incidentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/ServiceRequestCollection-update.json`);
const attachmentsRequiredParamsForCreatePayload = tools.requirePayload(`${__dirname}/assets/ServiceRequestCollectionServiceRequestAttachmentFolderAttachments-requiredQueryParam-c.json`) 

const incidentsOptions = {
  churros: {
    updatePayload: incidentsUpdatePayload
  }
};

// Calling the incidents endpoint (ServiceRequestCollection) directly to test {objectName} APIs
suite.forElement('helpdesk', 'ServiceRequestCollection', { payload: incidentsCreatePayload }, (test) => {
  test.withOptions(incidentsOptions).should.supportCruds();
  test.should.supportCeqlSearch('id');
  test.should.supportPagination();
  it(`should allow CRUDS for ${test.api}/:id/ServiceRequestDescription`, () => {
    let id, commentId;
    return cloud.post(test.api, incidentsCreatePayload)
      .then(r => id = r.body.id)
      .then(r => cloud.post(`${test.api}/${id}/ServiceRequestDescription`, commentsCreatePayload))
      .then(r => commentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${id}/ServiceRequestDescription/${commentId}`))
      .then(r => cloud.patch(`/ServiceRequestDescriptionCollection/${commentId}`, commentsUpdatePayload))
      .then(r => cloud.get(`${test.api}/${id}/ServiceRequestDescription`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1 }}).get(`${test.api}/${id}/ServiceRequestDescription`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`/ServiceRequestDescriptionCollection/${commentId}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });

  it(`should allow CRDS for ${test.api}/:id/ServiceRequestAttachmentFolder`, () => {
    let metadata = attachmentsRequiredParamsForCreatePayload;
    let incidentId, attachmentId;
    let metadataOptions = {
      formData: {
        metadata: JSON.stringify(metadata)
      }
    };
    return cloud.post(test.api, incidentsCreatePayload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.withOptions(metadataOptions).postFile(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder/attachments`, __dirname + '/assets/ServiceRequestCollectionServiceRequestAttachmentFolderAttachments-create.jpg'))
      .then(r => attachmentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder/${attachmentId}`))
      .then(r => cloud.get(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1 }}).get(`${test.api}/${incidentId}/ServiceRequestAttachmentFolder`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`/ServiceRequestAttachmentFolderCollection/${attachmentId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });
});
