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

const incidentCommentsOptions = {
  churros: {
    updatePayload: incidentsCommentsUpdatePayload
  }
};

suite.forElement('helpdesk', 'incidents', { payload: incidentsCreatePayload }, (test) => {
  let incidentId;

  before(() => cloud.post(test.api, incidentsCreatePayload)
    .then(r => incidentId = r.body.id));

  after(() => cloud.delete(`${test.api}/${incidentId}`));

  test.withOptions(incidentsOptions).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');

  it(`should allow nested Ceql search for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `Name.content = '${incidentsCreatePayload.Name.content}'` } }).get(test.api)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body[0].Name.content).to.equal(incidentsCreatePayload.Name.content);
      });
  });

  it(`should allow CRUDSS for /hubs/helpdesk/incidents/{id}/comments`, () => {
    return cloud.withOptions(incidentCommentsOptions).cruds(`/hubs/helpdesk/incidents/${incidentId}/comments`, incidentsCommentsCreatePayload);
  });

  it(`should allow paginating for ${test.api}/:id/comments`, () => {
    let incidentCommentId1, incidentCommentId2;
    return cloud.post(`${test.api}/${incidentId}/comments`, incidentsCommentsCreatePayload)
      .then(r => incidentCommentId1 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${incidentId}/comments`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.post(`${test.api}/${incidentId}/comments`, incidentsCommentsCreatePayload))
      .then(r => incidentCommentId2 = r.body.id)
      .then(r => cloud.withOptions({ qs: { pageSize: 2 } }).get(`${test.api}/${incidentId}/comments`))
      .then(r => expect(r.body.length).to.equal(2))
      .then(r => cloud.delete(`${test.api}/${incidentId}/comments/${incidentCommentId1}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}/comments/${incidentCommentId2}`));
  });

  it(`should allow CRDS for ${test.api}/:id/attachments`, () => {
    let attachmentId;
    let metadataOptions = {
      formData: {
        metadata: JSON.stringify(incidentsAttachmentsQueryParamPayload)
      }
    };
    return cloud.withOptions(metadataOptions).postFile(`${test.api}/${incidentId}/attachments`, __dirname + '/assets/incidentsAttachments-create.jpg')
      .then(r => attachmentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${incidentId}/attachments/${attachmentId}`))
      .then(r => cloud.get(`${test.api}/${incidentId}/attachments`))
      .then(r => cloud.withOptions({ qs: { pageSize: 1 } }).get(`${test.api}/${incidentId}/attachments`))
      .then(r => expect(r.body.length).to.equal(1))
      .then(r => cloud.delete(`${test.api}/${incidentId}/attachments/${attachmentId}`));
  });
});
