'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = require('./assets/incidents');
const commentPayload = require('./assets/incidentComments');
const incidentProperties = tools.requirePayload(`${__dirname}/assets/incidentProperties.json`);
const notifyPayload = require('./assets/notification');

suite.forElement('helpdesk', 'incidents', { payload: payload }, (test) => {

  let summary, customField;

  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
  it(`Should support S for ${test.api} with fields: query`, () => {
    return cloud.withOptions({ qs: { fields: 'fixVersions,summary' } }).get(test.api)
    .then(r => {
      r.body.forEach(incident => {
        let keys = Object.keys(incident.fields);
        if (expect(keys.length).to.be.above(0) && expect(keys.length).to.be.below(3)) {
          expect(incident.fields).to.contain.key('fixVersions') || expect(keys).to.contain.key('summary');
        }
      });
    });
  });
  
  it('should allow CRUDS for /incidents/:id/comments', () => {
    let incidentId;
    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.cruds('/hubs/helpdesk/incidents/' + incidentId + '/comments', commentPayload))
      .then(r => cloud.delete('/hubs/helpdesk/incidents/' + incidentId));
  });

  it('should allow CS for /incidents/:id/attachments and RD for /attachments', () => {
    let query = { fileName: "testfile.txt" };
    let incidentId, attachmentId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.withOptions({ qs: query }).postFile(`hubs/helpdesk/incidents/${incidentId}/attachments`, __dirname + '/assets/attach.txt'))
      .then(r => cloud.get(`hubs/helpdesk/incidents/${incidentId}/attachments`))
      .then(r => attachmentId = r.body[0].id)
      .then(r => cloud.get(`/hubs/helpdesk/attachments/${attachmentId}`))
      .then(r => cloud.delete(`/hubs/helpdesk/attachments/${attachmentId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow SR for /incidents/:id/history', () => {
    let incidentId, historyId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.cd('/hubs/helpdesk/incidents/' + incidentId + '/comments', commentPayload))
      .then(r => cloud.get(`${test.api}/${incidentId}/history`))
      .then(r => historyId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${incidentId}/history/${historyId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow creating for /incidents/:id/notifications', () => {
    let incidentId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.post(`hubs/helpdesk/incidents/${incidentId}/notifications`, notifyPayload))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  it('should allow CRUDS for /incidents/:id/properties', () => {
    let incidentPropertyId = incidentProperties.value.keys[0].key;
    let incidentId;

    return cloud.post('/hubs/helpdesk/incidents', payload)
      .then(r => incidentId = r.body.id)
      .then(r => cloud.put(`/hubs/helpdesk/incidents/${incidentId}/properties/${incidentPropertyId}`, incidentProperties))
      .then(r => cloud.get(`/hubs/helpdesk/incidents/${incidentId}/properties`))
      .then(r => cloud.get(`/hubs/helpdesk/incidents/${incidentId}/properties/${incidentPropertyId}`))
      .then(r => cloud.delete(`/hubs/helpdesk/incidents/${incidentId}/properties/${incidentPropertyId}`))
      .then(r => cloud.delete(`${test.api}/${incidentId}`));
  });

  before(() => cloud.get(test.api)
    .then(r => {
      customField = r.body[0].fields.customfield_10100;
      summary = r.body[0].fields.summary;
    }));


  it(`should allow GET /incidents with option defaultFields LIKE`, () => {
    return cloud.withOptions({ qs: { where: `summary LIKE '${summary}'` } }).get(test.api)
      .then(r => expect(r.body[0].fields.summary).to.contains(`${summary}`));
  });

  it(`should allow GET /incidents with option customfields`, () => {
    return cloud.withOptions({ qs: { where: `customfield_10100 = '${customField}'` } }).get(test.api)
      .then(r => expect(r.body[0].fields.customfield_10100).to.be.equal(`${customField}`));
  });

});
