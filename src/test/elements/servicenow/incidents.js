'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

let incidentsCreatePayload = tools.requirePayload(`${__dirname}/assets/incidents-create.json`);
let incidentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/incidents-update.json`);
let incidentsCommentsCreatePayload = tools.requirePayload(`${__dirname}/assets/incidentsComments-create.json`);
let incidentsWorkNotesCreatePayload = tools.requirePayload(`${__dirname}/assets/incidentsWorkNotes-create.json`);

const incidentsOptions = {
  churros: {
    updatePayload: incidentsUpdatePayload
  }
};


suite.forElement('helpdesk', 'incidents', { payload: incidentsCreatePayload }, (test) => {
  let incidentId;

  before(() => cloud.post(test.api, incidentsCreatePayload)
  .then(r => incidentId = r.body.id));

  after(() => cloud.delete(`${test.api}/${incidentId}`));

  test.should.supportPagination();
  test.withOptions(incidentsOptions).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('description');

  it(`should allow CS for /hubs/helpdesk/incidents/{id}/comments`, () => {
    return cloud.cs(`/hubs/helpdesk/incidents/${incidentId}/comments`, incidentsCommentsCreatePayload);
  });

  it(`should allow CS for /hubs/helpdesk/incidents/{id}/work-notes`, () => {
    return cloud.cs(`/hubs/helpdesk/incidents/${incidentId}/work-notes`, incidentsWorkNotesCreatePayload);
  });

  it('should allow CRDS for /hubs/helpdesk/incidents/{id}/attachments', () => {
    let attachmentId = -1;
    return cloud.postFile(`${test.api}/${incidentId}/attachments`, __dirname + '/assets/attach.txt')
      .then(r => attachmentId = r.body.sys_id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${incidentId}/attachments`))
      .then(r => cloud.withOptions({ qs: { where: 'sys_created_on>=\'2016-02-06T16:35:36\'' } }).get(`${test.api}/${incidentId}/attachments`))
      .then(r => cloud.get(`${test.api}/${incidentId}/attachments/${attachmentId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}/attachments/${attachmentId}`));
  });

});
