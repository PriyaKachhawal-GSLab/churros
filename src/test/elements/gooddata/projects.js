'use strict';

const suite = require('core/suite');
const payload = require('./assets/projects');
const reportDefinitionPayload = require('./assets/reports');
const cloud = require('core/cloud');

//Need to skip as admin rights are needed for operations on projects resource
suite.forElement('db', 'projects', { payload: payload, skip: true }, (test) => {
  test.withOptions({skip:true}).should.supportCrds();
  // get projects for authenticated user
  test.should.return200OnGet();

  it('should allow POST for /projects/{projectId}/reports-definition', () => {
    return cloud.get(test.api)
    .then(r => r.body[0].project.links.self.substr(14))
    .then(projectId => cloud.post(`${test.api}/${projectId}/reports-definition`, reportDefinitionPayload));
  });

  it('should allow GET for /projects/{id}/reports', () => {
    return cloud.get(test.api)
    .then(r => r.body[0].project.links.self.substr(14))
    .then(projectId => cloud.get(`${test.api}/${projectId}/reports`));
  });

  it('should allow PATCH for /projects/{id}/reports/json', () => {
    let projectId = '';
    let report_request = {
      "report": "{object_id}"
    };
    return cloud.get(test.api)
    .then(r => projectId = r.body[0].project.links.self.substr(14))
    .then(() => cloud.get(`${test.api}/${projectId}/reports`))
    .then(r => report_request.report = r.body[0].link.substr(r.body[0].link.indexOf("/obj/") + 5))
    .then(() => cloud.patch(`${test.api}/${projectId}/reports/json`, report_request));
  });

  it('should allow GET for /projects/{id}/reports/json', () => {
    let projectId = '';
    let report_request = {
      "report": "{object_id}"
    };
    return cloud.get(test.api)
    .then(r => projectId = r.body[0].project.links.self.substr(14))
    .then(() => cloud.get(`${test.api}/${projectId}/reports`))
    .then(r => report_request.report = r.body[0].link.substr(r.body[0].link.indexOf("/obj/") + 5))
    .then(() => cloud.patch(`${test.api}/${projectId}/reports/json`, report_request))
    .then(r => r.body.execResult.dataResult.substr(r.body.execResult.dataResult.indexOf("dataResult/") + 11))
    .then(reportId => cloud.withOptions({qs:{reportId:reportId}}).get(`${test.api}/${projectId}/reports/json`));
  });

  it('should allow PATCH for /projects/{id}/reports/csv', () => {
    let projectId = '';
    let report_request = {
      "report": "{object_id}"
    };
    return cloud.get(test.api)
    .then(r => projectId = r.body[0].project.links.self.substr(14))
    .then(() => cloud.get(`${test.api}/${projectId}/reports`))
    .then(r => report_request.report = r.body[0].link.substr(r.body[0].link.indexOf("/obj/") + 5))
    .then(() => cloud.patch(`${test.api}/${projectId}/reports/csv`, report_request));
  });

  it('should allow GET for /projects/{id}/reports/csv', () => {
    let projectId = '';
    let report_request = {
      "report": "{object_id}"
    };
    return cloud.get(test.api)
    .then(r => projectId = r.body[0].project.links.self.substr(14))
    .then(() => cloud.get(`${test.api}/${projectId}/reports`))
    .then(r => report_request.report = r.body[0].link.substr(r.body[0].link.indexOf("/obj/") + 5))
    .then(() => cloud.patch(`${test.api}/${projectId}/reports/csv`, report_request))
    .then(r => r.body.uri.substr(r.body.uri.indexOf('raw/') + 4))
    .then(reportHash => cloud.withOptions({qs:{reportHash:reportHash}}).get(`${test.api}/${projectId}/reports/csv`));
  });

});
